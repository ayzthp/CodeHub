# Real-Time Sync Testing Guide

## Overview
The collaborative code editor uses Firestore real-time listeners to sync code changes between participants. This guide helps you test and debug the real-time sync functionality.

## How Real-Time Sync Works

1. **Firestore Listener**: Each room page sets up a real-time listener to the room document
2. **Code Updates**: When the current editor types, changes are debounced and sent to Firestore
3. **Real-Time Updates**: All participants receive updates via the Firestore listener
4. **Permission Control**: Only the current editor can modify code, others see changes in real-time

## Testing Steps

### 1. Create a Room
1. Go to http://localhost:3000
2. Sign in with your account
3. Click "Create Room"
4. Fill in room details and create the room

### 2. Test Single User Sync
1. Open the browser console (F12)
2. Look for these debug messages:
   - `🔍 Setting up real-time listener for room: [roomId]`
   - `📡 Real-time update received: [room data]`
   - `👑 User permissions: [permissions]`

3. Type in the code editor
4. Look for these messages:
   - `✏️ Editor change detected, isEditor: true`
   - `⌨️ Code change detected, debouncing update...`
   - `📤 Sending code update to Firestore: [code preview]`
   - `✅ Code update sent successfully`

### 3. Test Multi-User Sync
1. Open the room in two different browser windows/tabs
2. Sign in with different accounts in each window
3. In the first window, make sure you're the editor (host is editor by default)
4. Type code in the first window
5. Watch the second window - code should update automatically
6. Look for sync indicators in the UI:
   - `🔄 Synced [timestamp]` badge
   - `✍️ Typing...` indicator when someone is typing

### 4. Test Editor Transfer
1. In the host window, use the "Make Editor" button to transfer control
2. The new editor should be able to type and sync changes
3. The previous editor should see changes but not be able to edit

### 5. Test Code Execution Sync
1. Run code in one window
2. The output should appear in all windows
3. Look for the execution result in the output area

## Debug Console Messages

### Setup Messages
- `🔍 Setting up real-time listener for room: [roomId]` - Listener initialized
- `👤 Current user: [userId]` - User authentication info
- `📡 Real-time update received: [data]` - Firestore update received

### Code Sync Messages
- `✏️ Editor change detected, isEditor: [true/false]` - Code change detected
- `⌨️ Code change detected, debouncing update...` - Debouncing started
- `📤 Sending code update to Firestore: [preview]` - Update being sent
- `✅ Code update sent successfully` - Update successful
- `🔄 Updating code from Firestore: [preview]` - Receiving update

### Permission Messages
- `👑 User permissions: [permissions]` - Current user permissions
- `👁️ User is not editor, skipping update` - Non-editor trying to edit

## Common Issues and Solutions

### Issue: Code not syncing
**Symptoms**: Changes in one window don't appear in another
**Debug Steps**:
1. Check console for error messages
2. Verify both users are in the same room
3. Check if the editor permission is correct
4. Look for Firestore connection errors

### Issue: Can't edit code
**Symptoms**: Editor shows "View Only" or can't type
**Debug Steps**:
1. Check if you're the current editor
2. Look for `👑 User permissions` in console
3. Ask host to transfer editor control

### Issue: Real-time listener not working
**Symptoms**: No console messages about real-time updates
**Debug Steps**:
1. Check Firebase configuration
2. Verify internet connection
3. Check Firestore rules
4. Look for authentication errors

## Test Button
Use the "🧪 Test Sync" button to manually trigger a code update and verify the sync is working.

## Expected Behavior
- Code changes should sync within 300ms (debounce delay)
- All participants should see typing indicators
- Editor control should transfer properly
- Code execution results should sync to all participants
- Sync timestamps should update in real-time

## Troubleshooting
If real-time sync is not working:
1. Check browser console for errors
2. Verify Firebase project configuration
3. Check Firestore security rules
4. Ensure both users are authenticated
5. Try refreshing the page
6. Check network connectivity 