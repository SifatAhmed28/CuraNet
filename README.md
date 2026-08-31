# CuraNet Frontend — Healthcare Literacy Hub

This is the frontend-only implementation for the CuraNet Healthcare Literacy Hub. It contains two separate feature folders: `src/features/courses/` and `src/features/firstAid/`.

## Run the React website in VS Code
1. Extract this ZIP.
2. Open the `CuraNet-Frontend` folder in VS Code.
3. Open Terminal in that folder.
4. Run `npm install` once.
5. Run `npm run dev`.
6. Open the `http://localhost:5173` address shown by Vite.

Do **not** double-click `index.html` for the React app; Vite must run the app.

## If you only want to see the content immediately
Open `direct-demo.html` in a browser. It is a no-install visual demo containing the course list and first-aid/remedies list.

## Main routes
- `/` — Home with visible Courses and First Aid sections
- `/courses` — full course catalogue, search and category filter
- `/courses/:courseId` — course details and enrollment
- `/courses/:courseId/lessons/:lessonId` — lesson viewer and progress
- `/first-aid` — complete first-aid topic list and search
- `/first-aid/:topicId` — measures, avoid list and when-to-seek-help
