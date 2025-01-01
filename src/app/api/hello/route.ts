import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";

// Constants
const MERCHANT_SECRET_KEY = new Uint8Array(
  JSON.parse(
    "[226,230,33,166,183,94,221,240,76,0,177,119,22,166,134,93,69,185,83,121,221,13,229,219,18,55,91,84,86,112,53,87,139,130,97,105,159,216,5,167,211,57,175,154,105,195,156,4,68,100,253,224,35,32,204,44,126,175,226,176,146,254,206,226]"
  )
);
const MERCHANT_PUBLIC_KEY = Keypair.fromSecretKey(MERCHANT_SECRET_KEY).publicKey;
const SOLANA_NETWORK = "https://api.devnet.solana.com";
const RECIPIENT_PUBLIC_KEY = new PublicKey(
  "APaynxjiBJBrEX5rqYBTbmSFN4NhPg6TKzkTmhG7URoX"
);

// **GET Request Handler**
export async function GET() {
  const label = "SolAndy Pay";
  const icon = "https://avatars.githubusercontent.com/u/92437260?v=4";

  console.log(label)
  return NextResponse.json({ label, icon });
}

// **POST Request Handler**
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const accountField = body?.account;

    if (!accountField) {
      throw new Error("Missing account field in the request body.");
    }

    const sender = new PublicKey(accountField);

    // Build the transaction
    const connection = new Connection(SOLANA_NETWORK, "confirmed");
    const ix = SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: RECIPIENT_PUBLIC_KEY,
      lamports: 133700000, // Amount in lamports (0.1337 SOL)
    });

    let transaction = new Transaction().add(ix);
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = MERCHANT_PUBLIC_KEY;

    transaction = Transaction.from(
      transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      })
    );

    // Sign the transaction
    const merchantKeypair = Keypair.fromSecretKey(MERCHANT_SECRET_KEY);
    transaction.sign(merchantKeypair);

    // Log the signature for debugging
    console.log("Transaction signature:", transaction.signature?.toString());

    // Airdrop 1 SOL to the sender (for demonstration purposes)
    await connection.requestAirdrop(sender, 1000000000); // 1 SOL in lamports

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });

    const base64Transaction = serializedTransaction.toString("base64");
    const message = "Thank you for using AndyPay";

    return NextResponse.json({ transaction: base64Transaction, message });
  } catch (error: any) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
