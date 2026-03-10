import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GameScore,
  ImageRequest,
  Message,
  UserProfile,
} from "../backend.d.ts";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useImageHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ImageRequest[]>({
    queryKey: ["imageHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getImageHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopScores(gameName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<GameScore[]>({
    queryKey: ["topScores", gameName],
    queryFn: async () => {
      if (!actor || !gameName) return [];
      try {
        return await actor.getTopScores(gameName);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!gameName,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.registerUser();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      role,
      content,
    }: { role: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.addMessage(role, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useConsumeTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      actionName,
    }: { amount: bigint; actionName: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.consumeTokens(amount, actionName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAddImageRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      prompt,
      style,
    }: { prompt: string; style: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.addImageRequest(prompt, style);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["imageHistory"] });
    },
  });
}

export function useSaveScore() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      gameName,
      score,
    }: { gameName: string; score: bigint }) => {
      if (!actor) throw new Error("No actor");
      await actor.saveScore(gameName, score);
    },
  });
}

export function useUpgradeToPremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.upgradeToPremium();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useResetMonthlyTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.resetMonthlyTokens();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
