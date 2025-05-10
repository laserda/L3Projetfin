"use client";
import React, { useEffect, useState } from "react";
import { getAgentById } from "@/server/auth/agent";

import { useParams } from "next/navigation";
import Profile from "./profile";

function page() {
  const [agent, setAgent] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  //   const agentID = pathname
  const getAgent = async () => {
    setLoading(true);
    const res = await getAgentById(id as string, false);
    setAgent(res);
    setLoading(false);
  };
  useEffect(() => {
    getAgent();
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-ci-orange">Chargement...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between  flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>

        <Profile agent={agent} />
      </div>
    </>
  );
}

export default page;
