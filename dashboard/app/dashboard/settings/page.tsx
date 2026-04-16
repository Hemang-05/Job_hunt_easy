import { UserProfile } from '@clerk/nextjs'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your Fillr email, authentication, and security.
        </p>
      </div>
      
      {/* 
        Clerk's UserProfile is a ready-made full account management UI. 
        It handles password changes, connected accounts, and 2FA out of the box.
      */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-full inline-block">
        <UserProfile
          appearance={{
            elements: {
              card: "shadow-none border-0",
              navbar: "hidden", // Simplify the embed styling
              pageScrollBox: "p-6",
            }
          }}
        />
      </div>
    </div>
  )
}
