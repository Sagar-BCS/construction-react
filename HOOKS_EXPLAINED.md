# React Hooks Cheat Sheet

This document explains the advanced React hooks used throughout the `construction-react` application (excluding standard `useState` and `useEffect`).

---

## 1. `useCallback`
**Where it's used:** `Expenses.jsx`, `Home.jsx`, `AuthContext.jsx`
**What it does:** Returns a memoized version of a function. 
**Why we used it:** Every time a React component re-renders, any functions defined inside it are recreated in memory. If you pass these functions as props to child components (or use them in dependency arrays), it forces the children to re-render unnecessarily. `useCallback` ensures the function reference remains exactly the same across renders unless its dependencies change. For example, the `handleRefresh` button in `Home.jsx` uses it so that it's stable.

---

## 2. `useMemo`
**Where it's used:** `Expenses.jsx`, `AuthContext.jsx`
**What it does:** Caches (memoizes) the result of an expensive calculation.
**Why we used it:** In `Expenses.jsx`, we use `useMemo` to filter the expenses list based on the search term. Without it, the filtering loop would run on *every single render* (even if the user just clicked "New Expense" to toggle the form). By using `useMemo`, React only recalculates the filtered list when the original `expenses` array or the `deferredSearch` string changes.

---

## 3. `useReducer`
**Where it's used:** `Expenses.jsx`
**What it does:** An alternative to `useState` that manages complex state logic via a "reducer" function and "actions".
**Why we used it:** The "Create Expense" form has many related state variables (expense name, details, site ID, payment method, files, loading status, errors, success messages). Managing 10 different `useState` hooks for a single form is messy. `useReducer` allowed us to centralize all form logic into a single `formReducer` function, making state transitions (like `SUBMIT_START` or `SUBMIT_ERROR`) clean and predictable.

---

## 4. `useRef`
**Where it's used:** `Login.jsx`, `Sidebar.jsx`, `Expenses.jsx`
**What it does:** Creates a mutable reference that persists across renders, without causing re-renders when updated. Often used to grab direct references to DOM elements.
**Why we used it:** 
- In `Login.jsx`: We attach it to the email input field and call `emailInputRef.current.focus()` to automatically put the user's cursor in the box when the page loads.
- In `Expenses.jsx`: We attach it to the file inputs so we can manually clear the selected files (`fileInputRef.current.value = ''`) after a successful form submission.
- In `Sidebar.jsx`: We use it to measure the actual pixel width of the sidebar DOM element.

---

## 5. `useId`
**Where it's used:** `Login.jsx`, `Expenses.jsx`
**What it does:** Generates a unique, stable string ID for accessibility attributes.
**Why we used it:** When building forms, it's best practice to link a `<label htmlFor="some-id">` to an `<input id="some-id">`. If you hardcode `"some-id"`, and that component is rendered twice on the same page, the IDs will clash and break accessibility. `useId()` generates a guaranteed unique ID (like `:r3:`) every time the component mounts.

---

## 6. `useDeferredValue`
**Where it's used:** `Expenses.jsx`
**What it does:** Allows React to defer updating a non-urgent part of the UI.
**Why we used it:** We used it on the search bar in the Expenses page. Typing in an input is an "urgent" update—the user needs to see the letters appear instantly. Filtering a massive list of expenses is "non-urgent". `useDeferredValue(debouncedSearch)` tells React: "Update the input box immediately, but hold off on updating the filtered list until you have some free processing time." This keeps the UI from feeling laggy when typing fast.

---

## 7. `useLayoutEffect`
**Where it's used:** `Sidebar.jsx`
**What it does:** Identical to `useEffect`, but it fires *synchronously* after all DOM mutations, before the browser has a chance to paint the screen.
**Why we used it:** We used it to measure the width of the sidebar right after it opens or closes. If we used `useEffect`, the browser would paint the screen, then the effect would run, state would update, and it would paint again—potentially causing a visual "flicker". `useLayoutEffect` guarantees the measurement and state update happen before the user sees anything.

---

## Custom Hooks
We also built custom hooks combining standard hooks to encapsulate logic:
- **`useFetch`**: Wraps `useEffect` and `useState` to cleanly manage API loading, error, and data states in one line.
- **`useDebounce`**: Wraps `useEffect` and `setTimeout` to delay updating a value (like a search query) until the user has stopped typing for a few hundred milliseconds.
- **`useLocalStorage`**: Wraps `useState` to automatically sync a state variable with the browser's `localStorage` (used for the JWT token).
- **`useDocumentTitle`**: Wraps `useEffect` to change the browser tab title depending on the page you are on.
