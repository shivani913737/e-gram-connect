# E-Gram Connect

Build a full-stack web application called "E-Gram Panchayat" (Gram Connect) with a rural governance theme.

UI Design:

- Use a beautiful rural village background (fields, houses, nature)

- Add a top navigation bar with:

  - Logo and app name (E-Gram Panchayat)

  - About Us

  - Sign Up

  - Login

- On the homepage, display a centered card with a soft orange theme

Homepage Feature:

- Create a "Select Your Region" form with dropdowns:

  - State

  - District (Zilla)

  - Block

  - Village

- Add a "Fetch Details" button

- Dropdowns should be dynamic (selection updates next dropdown)

Core Features:

1. User Authentication:

- Signup and login system

- Secure authentication

2. Dashboard:

- After login, redirect to dashboard

- Show options like:

  - Village Details

  - Government Schemes

  - Audit/Records

3. Village Details:

- Show detailed information about selected village

- Allow adding/updating village data

4. Government Schemes:

- Create multiple scheme pages

- Show scheme details in simple format

5. Audit / Records:

- Display stored village records and activities

6. Backend:

- Create APIs for region selection and data fetching

- Handle all frontend requests

7. Database:

- Store users and village data

- Store region hierarchy (state, district, block, village)

8. UI/UX:

- Mobile responsive

- Clean, simple, government-style design

- Easy for rural users

9. Extra:

- Form validation

- Error handling

- Loading indicators

Make the application fully functional with frontend, backend, and database connected.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e3ff2a2c-9e60-4598-a369-655723a11a3b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
