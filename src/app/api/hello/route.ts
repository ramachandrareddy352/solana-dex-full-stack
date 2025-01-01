import { createTransfer } from '@solana/pay';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionConfirmationStrategy } from '@solana/web3.js'
import { NextResponse } from 'next/server';
import { useDexProgram } from "../../../components/liquidity/data-mutaion";

interface GetResponse {
    label: string;
    icon: string;
}

export async function GET(request: Request): Promise<NextResponse> {
    const label = 'RCR PAYMENT';
    const icon = 'https://avatars.githubusercontent.com/u/92437260?v=4';
    console.log("GET REQUEST")

    return NextResponse.json({ label, icon });
}

interface PostResponse {
    transaction: string;
    message?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  console.log(body)

  const accountField = body.recipient;
  if (!accountField) throw new Error('missing account');

  const sender = new PublicKey(accountField);

  const merchant = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse("[195,244,178,84,138,60,237,22,247,155,217,194,140,11,241,16,239,243,94,88,76,73,210,238,14,69,182,81,94,221,124,232,44,150,171,61,45,2,165,191,213,76,92,186,0,243,199,0,190,253,28,178,33,149,29,104,37,76,218,65,114,96,230,233]")),
  );


  // Build Transaction
  const ix = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: new PublicKey("AuEHLxepJnFXXFmXhGwXEuroW5t1b3PewGyLMhbDycdn"),
    lamports: 133700000
  })

  let transaction = new Transaction();
  transaction.add(ix);

  const connection = new Connection("https://api.devnet.solana.com")
  const bh = await connection.getLatestBlockhash();
  transaction.recentBlockhash = bh.blockhash;
  transaction.feePayer = merchant.publicKey; 

  // for correct account ordering 
  transaction = Transaction.from(transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  }));

  transaction.sign(merchant);
  console.log(transaction.signature?.toString());

  // airdrop 1 SOL just for fun
  connection.requestAirdrop(sender, 1000000000);

  // Serialize and return the unsigned transaction.
  const serializedTransaction = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  const base64Transaction = serializedTransaction.toString('base64');
  const message = 'Thank you for using AndyPay';

  // const strategy : TransactionConfirmationStrategy =  {
  //   signature: transaction.
  // }
  // connection.confirmTransaction();

  return NextResponse.json({ transaction: base64Transaction, message });

}
