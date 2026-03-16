"use client"; 

import Image from "next/image";
import styles from "./page.module.css";
import { SystemLayout } from "@/components/client/templates/SystemLayout";
import Team from "@/pages/Team/Team";
import Users from "@/pages/Users/Users";

export default function Home() {
  return (
    <SystemLayout>
      <Users />
    </SystemLayout>
  );
}
