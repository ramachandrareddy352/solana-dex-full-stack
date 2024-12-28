"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { redirect } from "next/navigation";
import { WalletButton } from "../solana/solana-provider";

import { CreatePools } from "./create-pools";
import { ViewPools } from "./view-pools";
import { EyeOutlined, PlusCircleOutlined } from "@ant-design/icons";
// in pool as like add & remove liquidty add all listed pools and create pool
export default function Pools() {
  const { publicKey } = useWallet();

  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  return publicKey ? (
    <div className=" from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full" style={{ width: "600px" }}>
        <div className="bg-black rounded-xl shadow-lg p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("add")}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "add"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Pool &nbsp;&nbsp; <PlusCircleOutlined />
            </button>
            <button
              onClick={() => setActiveTab("remove")}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "remove"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              View Pools &nbsp;&nbsp; <EyeOutlined />
            </button>
          </div>
        </div>

        {activeTab === "add" ? <CreatePools /> : <ViewPools />}
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
