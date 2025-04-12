import {
  clusterApiUrl,
  PublicKey,
  Connection,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import BN from "bn.js";
import { NextApiRequest, NextApiResponse } from "next"
import { getAssociatedTokenAddress } from "@solana/spl-token";

const ENDPOINT = clusterApiUrl("devnet");
const PROGRAM_ID = new PublicKey("DX4TnoHCQoCCLC5pg7K49CMb9maMA3TMfHXiPBD55G1w");

export async function GET(request: NextApiRequest) {
  const label = "Solana Pay";
  const icon = "https://prasadpadala.in/insta/insta2square.JPG";
  return NextResponse.json({ label, icon }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account } = body;

    const { searchParams } = new URL(request.url);
    const mintAPubkey = searchParams.get("mintA");
    const mintBPubkey = searchParams.get("mintB");
    const depositAmountA = searchParams.get("depositAmountA");
    const depositAmountB = searchParams.get("depositAmountB");
    const minLiquidityBN = searchParams.get("minLiquidity");
    const feesBN = searchParams.get("fees");
    const referenceParam = searchParams.get("reference");

    if (
      !account ||
      !mintAPubkey ||
      !mintBPubkey ||
      !depositAmountA ||
      !depositAmountB ||
      !minLiquidityBN ||
      !feesBN ||
      !referenceParam
    ) {
      throw new Error("Missing required fields in request parameters.");
    }

    const reference = new PublicKey(referenceParam);
    const depositor = new PublicKey(account);
    const mintA = new PublicKey(mintAPubkey);
    const mintB = new PublicKey(mintBPubkey);

    const amountA = new BN(depositAmountA);
    const amountB = new BN(depositAmountB);
    const minLiquidity = new BN(minLiquidityBN);
    const fees = new BN(feesBN);

    // Derive PDAs
    const [amm] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm")],
      PROGRAM_ID
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), amm.toBuffer(), mintA.toBuffer(), mintB.toBuffer()],
      PROGRAM_ID
    );
    const [mintLiquidity] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity"), pool.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-a"), pool.toBuffer(), mintA.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountB] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-b"), pool.toBuffer(), mintB.toBuffer()],
      PROGRAM_ID
    );

    // User associated token accounts
    const depositorAccountA = await getAssociatedTokenAddress(mintA, depositor);
    const depositorAccountB = await getAssociatedTokenAddress(mintB, depositor);
    const depositorAccountLiquidity = await getAssociatedTokenAddress(mintLiquidity, depositor);

    const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const associatedTokenProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    const systemProgram = new PublicKey("11111111111111111111111111111111");
    const useEntireAmount = Buffer.from([0]);
+
    const depositIX = await program.methods
    .depositLiquidity(amountA, amountB, minLiquidity, fees, useEntireAmount)
    .accounts({
      amm,
      pool,
      depositor,
      mintLiquidity,
      mintA,
      mintB,
      poolAccountA,
      poolAccountB,
      depositorAccountLiquidity,
      depositorAccountA,
      depositorAccountB,
      tokenProgram,
      associatedTokenProgram,
      systemProgram
    })
    .instruction()

    depositIX.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

    const connection = new Connection(ENDPOINT);
    const transaction = new Transaction().add(depositIX);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = depositor;

    const serializedTransaction = transaction.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString("base64");

    return NextResponse.json(
      {
        transaction: base64Transaction,
        message: "Deposit liquidity transaction created successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
