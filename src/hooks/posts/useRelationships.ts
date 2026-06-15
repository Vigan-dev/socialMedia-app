'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiArray, apiPostData } from '@/lib/apiClient';
import { decodeNetworkUser } from '@/lib/apiSchemas';
import type { NetworkUser, Post } from '@/types/feed';
import type { Dispatch, SetStateAction } from 'react';
import { scoreTextMatch } from './postUtils';

type UseRelationshipsInput = {
  clearError: () => void;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  searchQuery: string;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  showError: (fallback: string, error?: unknown) => void;
};

export function useRelationships({
  clearError,
  isAuthReady,
  isLoggedIn,
  searchQuery,
  setPosts,
  showError,
}: UseRelationshipsInput) {
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [followers, setFollowers] = useState<NetworkUser[]>([]);
  const [following, setFollowing] = useState<NetworkUser[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<NetworkUser[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthReady) {
      return () => {
        isMounted = false;
      };
    }

    if (!isLoggedIn) {
      clearError();
      setUsers([]);
      setFollowers([]);
      setFollowing([]);
      setSuggestedUsers([]);
      return () => {
        isMounted = false;
      };
    }

    const loadRelationships = async () => {
      try {
        const [usersData, followersData, followingData, suggestionsData] =
          await Promise.all([
            apiArray('/users', decodeNetworkUser),
            apiArray('/users/me/followers', decodeNetworkUser),
            apiArray('/users/me/following', decodeNetworkUser),
            apiArray('/users/suggestions', decodeNetworkUser),
          ]);

        if (!isMounted) return;

        setUsers(usersData);
        setFollowers(followersData);
        setFollowing(followingData);
        setSuggestedUsers(suggestionsData);
      } catch (error) {
        console.error('Failed loading relationships:', error);

        if (isMounted) {
          setFollowers([]);
          setFollowing([]);
          setSuggestedUsers([]);
          showError('Failed to load your network. Try refreshing the page.', error);
        }
      }
    };

    loadRelationships();

    return () => {
      isMounted = false;
    };
  }, [clearError, isAuthReady, isLoggedIn, showError]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;

    return users
      .map((user) => {
        const textScore =
          scoreTextMatch(user.name, query, 3) +
          scoreTextMatch(user.handle, query, 2) +
          scoreTextMatch(user.role, query);
        const socialScore =
          Math.log10(user.followersCount + 1) * 8 +
          (user.isFollowing ? 12 : 0);
        const presenceScore = user.status === 'available' ? 3 : 0;
        const score = textScore + socialScore + presenceScore;

        return { user, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.user.followersCount - a.user.followersCount ||
          a.user.name.localeCompare(b.user.name),
      )
      .map((item) => item.user);
  }, [searchQuery, users]);

  const toggleFollow = async (userId: string) => {
    if (!userId) return;
    clearError();

    const updateRelationship = (isFollowing: boolean) => {
      const applyUserState = (user: NetworkUser): NetworkUser =>
        user.id === userId
          ? {
              ...user,
              isFollowing,
              followersCount: Math.max(
                0,
                user.followersCount + (isFollowing ? 1 : -1),
              ),
            }
          : user;

      setUsers((current) => current.map(applyUserState));
      setFollowers((current) => current.map(applyUserState));
      setSuggestedUsers((current) => {
        if (isFollowing) {
          return current.filter((user) => user.id !== userId);
        }

        const knownUser =
          users.find((user) => user.id === userId) ??
          followers.find((user) => user.id === userId) ??
          following.find((user) => user.id === userId) ??
          current.find((user) => user.id === userId);
        const next = current.map(applyUserState);

        if (!knownUser || next.some((user) => user.id === userId)) {
          return next;
        }

        return [applyUserState(knownUser), ...next].slice(0, 5);
      });
      setFollowing((current) => {
        const knownUser =
          users.find((user) => user.id === userId) ??
          followers.find((user) => user.id === userId) ??
          suggestedUsers.find((user) => user.id === userId);

        if (isFollowing && knownUser) {
          const nextUser = applyUserState(knownUser);
          return current.some((user) => user.id === userId)
            ? current.map(applyUserState)
            : [...current, nextUser].sort((a, b) =>
                a.name.localeCompare(b.name),
              );
        }

        if (!isFollowing) {
          return current.filter((user) => user.id !== userId);
        }

        return current.map(applyUserState);
      });

      setPosts((current) =>
        current.map((post) =>
          post.authorId === userId ? { ...post, isFollowing } : post,
        ),
      );
    };

    const currentUser =
      users.find((user) => user.id === userId) ??
      followers.find((user) => user.id === userId) ??
      following.find((user) => user.id === userId) ??
      suggestedUsers.find((user) => user.id === userId);
    const nextFollowing = !currentUser?.isFollowing;
    updateRelationship(nextFollowing);

    try {
      const data = await apiPostData(
        `/users/${userId}/follow`,
        undefined,
        'Failed to update follow',
        decodeNetworkUser,
      );

      const syncServerUser = (user: NetworkUser) =>
        user.id === userId ? data : user;

      setUsers((current) => current.map(syncServerUser));
      setFollowers((current) => current.map(syncServerUser));
      setFollowing((current) =>
        data.isFollowing
          ? current.some((user) => user.id === userId)
            ? current.map(syncServerUser)
            : [...current, data].sort((a, b) => a.name.localeCompare(b.name))
          : current.filter((user) => user.id !== userId),
      );
      setSuggestedUsers((current) =>
        data.isFollowing
          ? current.filter((user) => user.id !== userId)
          : current.some((user) => user.id === userId)
            ? current.map(syncServerUser)
            : [data, ...current].slice(0, 5),
      );
      setPosts((current) =>
        current.map((post) =>
          post.authorId === userId
            ? { ...post, isFollowing: data.isFollowing }
            : post,
        ),
      );
    } catch (error) {
      updateRelationship(!nextFollowing);
      showError('Follow update failed. Your network state was restored.', error);
    }
  };

  const removeUserFromLocalState = (userId: string) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setFollowers((current) => current.filter((user) => user.id !== userId));
    setFollowing((current) => current.filter((user) => user.id !== userId));
    setSuggestedUsers((current) => current.filter((user) => user.id !== userId));
    setPosts((current) => current.filter((post) => post.authorId !== userId));
  };

  return {
    filteredUsers,
    followers,
    following,
    followingCount: following.length,
    removeUserFromLocalState,
    suggestedUsers,
    toggleFollow,
    users,
  };
}
