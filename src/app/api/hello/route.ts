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
import { getAssociatedTokenAddress } from "@solana/spl-token";

const ENDPOINT = clusterApiUrl("devnet");
const PROGRAM_ID = new PublicKey("DX4TnoHCQoCCLC5pg7K49CMb9maMA3TMfHXiPBD55G1w");
const MEMO_PROGRAM_ID = new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");

const getInstructionData = (
  depositAmountA: BN,
  depositAmountB: BN,
  minLiquidity: BN,
  fees: BN,
  useEntireAmount: boolean
): Buffer => {
  const discriminator = sha256.digest("global:deposit_liquidity").slice(0, 8);
  return Buffer.concat([
    Buffer.from(discriminator),
    depositAmountA.toArrayLike(Buffer, "le", 8),
    depositAmountB.toArrayLike(Buffer, "le", 8),
    minLiquidity.toArrayLike(Buffer, "le", 8),
    fees.toArrayLike(Buffer, "le", 8),
    Buffer.from([useEntireAmount ? 1 : 0]),
  ]);
};

export async function GET(request: NextRequest) {
  const label = "Solana Pay";
  const icon = "https://prasadpadala.in/insta/insta2square.JPG";
  return NextResponse.json({ label, icon }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account } = body;

    const { searchParams } = new URL(request.url);
    const mintA = searchParams.get("mintA");
    const mintB = searchParams.get("mintB");
    const amountA = searchParams.get("amountA");
    const amountB = searchParams.get("amountB");
    const minLiquidity = searchParams.get("minLiquidity");
    const fees = searchParams.get("fees");
    const referenceParam = searchParams.get("reference");

    if (!account || !mintA || !mintB || !amountA || !amountB || !minLiquidity || !fees || !referenceParam) {
      throw new Error("Missing required fields in request parameters.");
    }

    const reference = new PublicKey(referenceParam);
    const sender = new PublicKey(account);
    const mintAPubkey = new PublicKey(mintA);
    const mintBPubkey = new PublicKey(mintB);

    const depositAmountABN = new BN(amountA);
    const depositAmountBBN = new BN(amountB);
    const minLiquidityBN = new BN(minLiquidity);
    const feesBN = new BN(fees);

    // Derive PDAs
    const [ammAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm")],
      PROGRAM_ID
    );
    const [poolAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), ammAccount.toBuffer(), mintAPubkey.toBuffer(), mintBPubkey.toBuffer()],
      PROGRAM_ID
    );
    const [mintLiquidity] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity"), poolAccount.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-a"), poolAccount.toBuffer(), mintAPubkey.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountB] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-b"), poolAccount.toBuffer(), mintBPubkey.toBuffer()],
      PROGRAM_ID
    );

    // User associated token accounts
    const depositorAccountA = await getAssociatedTokenAddress(mintAPubkey, sender);
    const depositorAccountB = await getAssociatedTokenAddress(mintBPubkey, sender);
    const depositorLiquidityAccount = await getAssociatedTokenAddress(mintLiquidity, sender);

    const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const associatedTokenProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    const systemProgram = new PublicKey("11111111111111111111111111111111");

    const instructionData = getInstructionData(
      depositAmountABN,
      depositAmountBBN,
      minLiquidityBN,
      feesBN,
      false
    );

    const depositIX = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: ammAccount, isSigner: false, isWritable: false },
        { pubkey: poolAccount, isSigner: false, isWritable: true },
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: mintLiquidity, isSigner: false, isWritable: true },
        { pubkey: mintAPubkey, isSigner: false, isWritable: false },
        { pubkey: mintBPubkey, isSigner: false, isWritable: false },
        { pubkey: poolAccountA, isSigner: false, isWritable: true },
        { pubkey: poolAccountB, isSigner: false, isWritable: true },
        { pubkey: depositorLiquidityAccount, isSigner: false, isWritable: true },
        { pubkey: depositorAccountA, isSigner: false, isWritable: true },
        { pubkey: depositorAccountB, isSigner: false, isWritable: true },
        { pubkey: tokenProgram, isSigner: false, isWritable: false },
        { pubkey: associatedTokenProgram, isSigner: false, isWritable: false },
        { pubkey: systemProgram, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });

    // Add memo instruction with reference account
    const memoInstruction = new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [
        { pubkey: reference, isSigner: false, isWritable: true }
      ],
      data: Buffer.from("Deposit liquidity via Solana Pay", "utf-8"),
    });

    const connection = new Connection(ENDPOINT);
    const transaction = new Transaction().add(depositIX).add(memoInstruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

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