"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { redirect } from "next/navigation";
import { WalletButton } from "../solana/solana-provider";

import { AddLiquidity } from "./add-liquidity";
import { RemoveLiquidity } from "./remove-liquidity";
import { FallOutlined, RiseOutlined } from "@ant-design/icons";
// in pool as like add & remove liquidty add all listed pools and create pool
export default function Liquidity() {
  const { publicKey } = useWallet();

  // if (publicKey) {
  //   return redirect(`/account/${publicKey.toString()}`)
  // }

  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  return publicKey ? (
    <div className=" from-blue-50 to-indigo-50 flex items-center justify-center p-4 text-white">
      <div className="w-full">
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
              Add Liquidity &nbsp;&nbsp; <RiseOutlined />
            </button>
            <button
              onClick={() => setActiveTab("remove")}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "remove"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Remove Liquidity &nbsp;&nbsp; <FallOutlined />
            </button>
          </div>
        </div>

        {activeTab === "add" ? <AddLiquidity /> : <RemoveLiquidity />}
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
