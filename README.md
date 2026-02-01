# USTHB Form Generator

A modern web application designed to help USTHB (University of Science and Technology Houari Boumediene) administration create, manage, and distribute official forms with AI-powered assistance.

## 🌟 Features

### Form Management
- **Create Custom Forms**: Build forms with multiple categories and various question types
- **AI-Powered Generation**: Use AI chat to generate form questions and structure automatically
- **Drag-and-Drop Interface**: Organize form elements with intuitive drag-and-drop functionality
- **Form Templates**: Save and reuse form templates for common administrative tasks

### Question Types
- Text input (short and long answers)
- Multiple choice
- Checkboxes
- Radio buttons
- Date selection
- Customizable validation rules

### Administration
- **User Management**: Create and manage user accounts with different permission levels
- **Form Sharing**: Generate unique links to share forms with specific audiences
- **Response Collection**: Collect and view form submissions in real-time
- **Response Analytics**: View detailed analytics and export response data
- **Deadline Management**: Set submission deadlines for forms

### AI Integration
- Interactive AI chat assistant for form creation
- Natural language processing to generate form questions
- Smart suggestions based on form context

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: 
  - Radix UI primitives
  - Custom component library with shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd
- **Animations**: Lottie animations (@lottiefiles/dotlottie-react)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun package manager

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/billal-be/usthb-form-generator.git
cd usthb-form-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables (if needed):
Create a `.env.local` file in the root directory if you need to configure custom environment variables for your deployment.

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎯 Usage

### For Administrators

1. **Login**: Access the admin panel through the login page
2. **Create Forms**: 
   - Navigate to the admin dashboard
   - Click "Create New Form"
   - Use the form builder or AI assistant to design your form
   - Add categories and questions
   - Set validation rules and deadlines
3. **Manage Users**: Create and manage user accounts from the admin panel
4. **View Responses**: Access form submissions and export data

### For Form Respondents

1. Access the form via the shared link
2. Fill out all required fields
3. Submit the form before the deadline
4. Receive confirmation upon successful submission

## 📁 Project Structure

```
usthb-form-generator/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin panel pages
│   │   ├── form/              # Public form pages
│   │   ├── home/              # Home pages
│   │   ├── login/             # Authentication
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   └── ui/                # UI component library
│   └── lib/                   # Utility functions
├── public/                    # Static assets
│   ├── animations/            # Lottie animations
│   └── logo.png              # Application logo
├── proxy.js                   # API proxy server
└── package.json              # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

The application connects to a backend API hosted at `https://projuniv-backend.onrender.com` for:
- User authentication
- Form CRUD operations
- Response management
- User management

AI features are powered by a Python backend at `https://syyklo.pythonanywhere.com` accessed through the local proxy server (`proxy.js`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🏫 About USTHB

This application is designed specifically for the University of Science and Technology Houari Boumediene (USTHB) administration to streamline the creation and management of official forms and documents.

## 📧 Support

For support and questions, please contact the development team or create an issue in the repository.
