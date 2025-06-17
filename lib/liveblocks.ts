import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || '',
  throttle: 16,
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON serializable.
type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  isTyping: boolean;
  role: string;
  code: string;
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. `Json` can be any serializable
// JSON value.
type Storage = {
  code: string;
  language: string;
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth backend (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    picture: string;
  };
};

// Optionally, the type of custom events broadcasted and listened for in this
// room. Must be JSON serializable.
type RoomEvent = {
  type: 'NOTIFICATION' | 'CODE_EXECUTED';
  message?: string;
  output?: string;
  executedBy?: string;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
  },
  useClient,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client); 