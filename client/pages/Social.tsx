import React from "react";
import SocialSection from "@/components/SocialSection";
import { UserRoute } from "@/components/RoleBasedRoute";

export default function Social() {
  return (
    <UserRoute>
      <div className="container mx-auto px-4 py-8">
        <SocialSection />
      </div>
    </UserRoute>
  );
}
