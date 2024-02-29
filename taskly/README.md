# Taskly - a demo app for testing Lightyear embedded integrations

## To test

### Full sync from another app

### Incremental sync from another

### Deletes on another app

### Deletes on taskly

### Bi-directional sync w/ conflict resolution

#### Full sync

1. Download all tasks from other app
2. Download all tasks from taskly
3. For each task from other app:
   a. Determine if it is new, updated, or updated/conflict
   b. If it is new, add it to taskly, then add a sync map entry with both hashes
   c. If it is updated, updated taskly, then update the sync map entry with the new hashes
   d. If it is updated/conflict, run merge code, then update the systems that have new hashes

Situations to handle:

Sync List requires pagination
Sync List generation requires longer than 10 minutes
Sync updates hit rate limit

Presentation

Define a custom app

Define a basic oauth integration

Define a sync integration

- Data type

Consume sync events from your app

Provide sync events from your app

Questions

- How many objects can be synced per user?
- How are sync conflicts handled?
