"use client";

import React, { useState, useEffect } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import { useDexProgram } from "./data-mutaion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ellipsify } from "../ui/ui-layout";
import { Modal, message, Image } from "antd";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";

type TokenData = {
  tokenMint: string;
  poolBalance: number;
  symbol: string;
  name: string;
};

export function AddLiquidity() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { program, poolAccounts, addLiquidityMutation } = useDexProgram();

  const [tokenDataA, setTokenDataA] = useState<TokenData[]>([]);
  const [tokenDataB, setTokenDataB] = useState<TokenData[]>([]);
  const [isLoading, setLoading] = useState(false);
  const metaplex = Metaplex.make(connection);

  const [fees, setFees] = useState(30);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [tokenOneAmount, setTokenOneAmount] = useState(0);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [tokenOne, setTokenOne] = useState<TokenData>();
  const [tokenTwo, setTokenTwo] = useState<TokenData>();
  const [userOneBalance, setUserOneBalance] = useState(0);
  const [userTwoBalance, setUserTwoBalance] = useState(0);

  const addLiquidity = async () => {
    if (
      tokenOneAmount != 0 &&
      tokenTwoAmount != 0 &&
      tokenOne?.tokenMint &&
      tokenTwo?.tokenMint
    ) {
      await addLiquidityMutation
        .mutateAsync({
          mintA: tokenOne?.tokenMint,
          mintB: tokenTwo?.tokenMint,
          fees: fees,
          amountA: tokenOneAmount,
          amountB: tokenTwoAmount,
        })
        .then((data) => {
          console.log("Liquidity added successfully!");
          console.log("Response data:", data); // Log the returned data
        });
      const ATAOne = await getAssociatedTokenAddress(
        new PublicKey(tokenOne.tokenMint),
        program.provider.publicKey || new PublicKey("")
      );
      try {
        const tokenAccount = await connection.getTokenAccountBalance(ATAOne);
        setUserOneBalance(tokenAccount.value.uiAmount || 0);
      } catch (error) {
        setUserOneBalance(0);
      }
      const ATATwo = await getAssociatedTokenAddress(
        new PublicKey(tokenTwo.tokenMint),
        program.provider.publicKey || new PublicKey("")
      );
      try {
        const tokenAccount = await connection.getTokenAccountBalance(ATATwo);
        setUserTwoBalance(tokenAccount.value.uiAmount || 0);
      } catch (error) {
        setUserTwoBalance(0);
      }
    } else {
      message.error("Please select both tokens and enter the amount");
    }
  };

  function openModal(asset: number) {
    setChangeToken(asset);
    if (asset == 1) {
      setIsOpen1(true);
    } else {
      setIsOpen2(true);
    }
  }

  async function modifyToken(i: number) {
    if (publicKey) {
      if (changeToken === 1) {
        const token = tokenDataA[i];
        const ATA = await getAssociatedTokenAddress(
          new PublicKey(token.tokenMint),
          publicKey
        );
        try {
          const tokenAccount = await connection.getTokenAccountBalance(ATA);
          setUserOneBalance(tokenAccount.value.uiAmount || 0);
        } catch (error) {
          setUserOneBalance(0);
        }
        setTokenOne(token);
        setIsOpen1(false);
      } else {
        const token = tokenDataB[i];
        const ATA = await getAssociatedTokenAddress(
          new PublicKey(token.tokenMint),
          publicKey
        );
        try {
          const tokenAccount = await connection.getTokenAccountBalance(ATA);
          setUserTwoBalance(tokenAccount.value.uiAmount || 0);
        } catch (error) {
          setUserTwoBalance(0);
        }
        setTokenTwo(token);
        setIsOpen2(false);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!poolAccounts.isLoading && poolAccounts.data) {
        const dataA: TokenData[] = [];
        const dataB: TokenData[] = [];
        const uniqueMintsA = new Set<string>();
        const uniqueMintsB = new Set<string>();

        for (const pool of poolAccounts.data) {
          try {
            const mintA = pool.account.mintA.toString();
            if (!uniqueMintsA.has(mintA)) {
              const balanceA = await connection.getTokenAccountBalance(
                pool.account.poolAccountA
              );
              const tokenAmountA = balanceA.value.uiAmount || 0;
              let symbolA = "NULL";
              let nameA = "UnKnown";
              const metadataAccountA = metaplex
                .nfts()
                .pdas()
                .metadata({ mint: pool.account.mintA });
              const metadataAccountInfoA = await connection.getAccountInfo(
                metadataAccountA
              );
              if (metadataAccountInfoA) {
                const tokenA = await metaplex
                  .nfts()
                  .findByMint({ mintAddress: pool.account.mintA });
                symbolA = tokenA.symbol;
                nameA = tokenA.name;
              }
              uniqueMintsA.add(mintA);
              dataA.push({
                tokenMint: mintA,
                poolBalance: tokenAmountA,
                symbol: symbolA,
                name: nameA,
              });
              console.log(dataA);
            }

            const mintB = pool.account.mintB.toString();
            if (!uniqueMintsB.has(mintB)) {
              const balanceB = await connection.getTokenAccountBalance(
                pool.account.poolAccountB
              );
              const tokenAmountB = balanceB.value.uiAmount || 0;
              let symbolB = "NULL";
              let nameB = "UnKnown";
              const metadataAccountB = metaplex
                .nfts()
                .pdas()
                .metadata({ mint: pool.account.mintB });
              const metadataAccountInfoB = await connection.getAccountInfo(
                metadataAccountB
              );
              if (metadataAccountInfoB) {
                const tokenB = await metaplex
                  .nfts()
                  .findByMint({ mintAddress: pool.account.mintB });
                symbolB = tokenB.symbol;
              }
              uniqueMintsB.add(mintB);
              dataB.push({
                tokenMint: mintB,
                poolBalance: tokenAmountB,
                symbol: symbolB,
                name: nameB,
              });
              console.log(dataB);
            }
          } catch (error) {
            console.error("Error fetching pool data:", error);
          }
        }

        setTokenDataA(dataA);
        setTokenDataB(dataB);
        console.log(tokenDataA);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div
      className="bg-zinc-900 w-[35%] p-4 px-6 rounded-xl my-2"
      style={{ width: "600px" }}
    >
      <Modal
        open={isOpen1}
        footer={null}
        onCancel={() => setIsOpen1(false)}
        title="Select a token"
        width={500}
      >
        <div className="modalContent">
          {tokenDataA?.map((token: TokenData, i: any) => {
            return (
              <div
                className="tokenChoice flex"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <div>
                  <Image
                    src="/token.webp"
                    alt={token.name}
                    className="tokenLogo"
                    width={50}
                    height={50}
                    style={{ float: "left" }}
                  />
                </div>
                <div
                  className="tokenChoiceNames px-5"
                  style={{ cursor: "pointer" }}
                >
                  <div className="tokenName">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="tokenTicker">{token.tokenMint}</div>
                  <br />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={isOpen2}
        footer={null}
        onCancel={() => setIsOpen2(false)}
        title="Select a token"
        width={500}
      >
        <div className="modalContent">
          {tokenDataB?.map((token: TokenData, i: any) => {
            return (
              <div
                className="tokenChoice flex"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <div>
                  <Image
                    src="/token.webp"
                    alt={token.name}
                    className="tokenLogo"
                    width={50}
                    height={50}
                    style={{ float: "left" }}
                  />
                </div>
                <div
                  className="tokenChoiceNames px-5"
                  style={{ cursor: "pointer" }}
                >
                  <div className="tokenName">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="tokenTicker">{token.tokenMint}</div>
                  <br />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {!isLoading ? (
        <div>
          <div className="relative bg-[#212429] p-4 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600">
            <div className="flex justify-between mb-2">
              <p>Balance : {userOneBalance}</p>
              <p>Mint-A</p>
            </div>
            <div className="flex items-center  justify-between">
              <div>
                <input
                  className=" w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent"
                  type="number"
                  onChange={(e) => setTokenOneAmount(parseInt(e.target.value))}
                  value={tokenOneAmount}
                  placeholder={"0.0"}
                />
              </div>
              <div
                className="flex p-2 pr-5 pl-3"
                style={{
                  backgroundColor: "black",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                <div
                  className="assetOne pb-1"
                  onClick={() => openModal(1)}
                  style={{ marginTop: "-7px" }}
                >
                  <Image
                    src="/token.webp"
                    alt={tokenOne?.name}
                    className="tokenLogo"
                    width={30}
                    height={30}
                    style={{ float: "left", marginTop: "7px" }}
                  />
                  {ellipsify(tokenOne?.tokenMint, 3)}
                  &nbsp;&nbsp;
                  <DownOutlined />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#212429] p-4 pb-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600">
            <div className="flex justify-between mb-2">
              <p>Balance : {userTwoBalance}</p>
              <p>Mint-B</p>
            </div>
            <div className="flex items-center  justify-between">
              <div>
                <input
                  className=" w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent"
                  type={"number"}
                  onChange={(e) => setTokenTwoAmount(parseInt(e.target.value))}
                  value={tokenTwoAmount}
                  placeholder={"0.0"}
                />
              </div>
              <div
                className="flex p-2 pr-5 pl-3"
                style={{
                  backgroundColor: "black",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                <div
                  className="assetOne pb-1"
                  onClick={() => openModal(2)}
                  style={{ marginTop: "-7px" }}
                >
                  <Image
                    src="/token.webp"
                    alt={tokenTwo?.name}
                    className="tokenLogo"
                    width={30}
                    height={30}
                    style={{ float: "left", marginTop: "7px" }}
                  />
                  <span>
                    {ellipsify(tokenTwo?.tokenMint, 3)}
                    &nbsp;&nbsp;
                    <DownOutlined />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <br />

          <fieldset>
            <legend className="text-sm font-medium text-grey-700 mb-2">
              Pool Fee
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {[10, 30, 100].map((fee: number) => (
                <div key={fee} className="relative">
                  <input
                    type="radio"
                    id={`fee-${fee}`}
                    name="fee"
                    value={fee}
                    checked={fees === fee}
                    onChange={(event) => setFees(fee)}
                    className="peer hidden"
                  />
                  <label
                    htmlFor={`fee-${fee}`}
                    className="flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer text-gray-700 bg-white hover:bg-gray-50 peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600 transition-all"
                    style={{
                      backgroundColor: `${fees === fee ? `grey` : ``}`,
                    }}
                  >
                    {fee / 100}&nbsp;%
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <br />
          <div>
            <p>
              <InfoCircleOutlined /> If the selected pool with fees is not
              exists, then transition will revert
            </p>
          </div>

          <div>
            {addLiquidityMutation.isPending ? (
              <div className="my-5" style={{ marginLeft: "45%" }}>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <button
                type="button"
                className="flex btn btn-outline-primary my-5"
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "20px",
                }}
                onClick={addLiquidity}
              >
                Add Liquidity
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: "470px" }}
        >
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </div>
  );
}