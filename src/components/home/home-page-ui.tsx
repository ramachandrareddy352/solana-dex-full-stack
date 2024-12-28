"use client";
import "./home-css.css";

export default function HomePage() {
  return (
    <div>
      <div className="container sm:px-6 lg:px-8 my-5">
        <div className="space-y-2">
          <div className="header" id="myHeader">
            <span>
              NOTE: Please read the instructions given below, which helps to
              make underdstanding of the protocol. If any issues or collabrating
              with projects please contact through Email or LinkedIn. This
              exchange only works on `devnet`.
            </span>
          </div>
          <div>
            <h3>1) View Pools</h3>
            <div>
              <p>
                -{">"} You can see the current trading pools on the protocol
                with the Mint-A & Mint-B token address, fees, liquidity in the
                pool and Mint-A & Mint-B total amount deposited in the pool.
              </p>
            </div>
          </div>
          <div>
            <h3>2) Create Pools</h3>
            <div>
              <p>-{">"} Any trader can create pool with two unique tokens.</p>
              <p>
                -{">"} Mint-A address should be greater than the Mint-B address.
              </p>
              <p>
                -{">"} To create a pool user have to pay 0.1 SOL to the pool
                admin. There is no need to add initial liquidity to the pool
                while creating.
              </p>
              <p>
                -{">"} Trading on exchange is works on single hop swap exchange,
                tarders cannot swap, add or remove liquidity when the pool is
                not exists.
              </p>
              <p>
                -{">"} User have to select any one of the fee tier to create
                pool with two uniqe tokens. With any two tokens any one can
                create only single pool even though having mutiple fee tiers.
              </p>
              <p>
                -{">"} Trading pool is works on principle of Automated Market
                Maker(AMM), x * y = k
              </p>
            </div>
          </div>
          <div>
            <h3>3) Add Liquidity</h3>
            <div>
              <p>
                -{">"} At initial liquidity the pool takes 100 liquidity tokens
                to avoid inflation attacks.
              </p>
              <p>
                -{">"} Traders have to select fees correctly, if the fees withe
                the selected tokens are not exists the adding of liquidity will
                fails.
              </p>
              <p>
                -{">"} Liquidity providers can add liquidity even in an unequal
                ratio compared to the existing pools token balances. The
                protocol automatically swaps the excess tokens on a DEX (like
                Raydium) to balance the ratio and adds the full amount to the
                pool.
              </p>
              <p>-{">"} Example </p>
              <div style={{ textAlign: "center", margin: "15px" }}>
                <p>
                  A liquidity pool contains: Token-A: 100 units Token-B: 200
                  units The pool follows a constant ratio (1:2 ratio) between
                  Token-A and Token-B.
                </p>
                <p>
                  A liquidity provider (LP) wants to add liquidity but provides
                  tokens in a different ratio: Token-A: 50 units Token-B: 300
                  units(1:6 ratio).
                </p>
                <p>
                  The protocol uses Raydium DEX to swap the excess Token-B into
                  Token-A.
                </p>
                <p>
                  At initial we take Token-A: 50 units and Token-B: 100 units
                  with respective to pool balance ratios.
                </p>
                <p>
                  With the excess Token-B amount of 200 units we divide with 3
                  units(1+2), with that we swap Token-A with the 1 ratio amount
                  of exceed 200 Units.
                </p>
                <p>
                  i.e, 66.6 Token-B units are swapped to Token-A in Raydium DEX
                  by calculating fees.
                </p>
                <p>
                  After swapping the total Amount-A: 116.6 and Amount-B:
                  233.4(1:2 ration) tokens of liquidity is added
                </p>
              </div>
              <p>
                -{">"}This feature makes easy to add any ratio amount of
                liquidity to the pool.
              </p>
            </div>
          </div>
          <div>
            <h3>4) Remove Liquidity</h3>
            <div>
              <p>
                -{">"} Trader will get all the swap fees of the pool. Adding and
                Removing liquidity works based on the minting and burning of
                shares.(ERC-4626 vault)
              </p>
              <p>
                -{">"} Trader have to select correct fees and tokens to withdraw
                liquidity.
              </p>
              <p>
                -{">"} There is no liquidity fees is collected during adding and
                removing of liquidity tokens.
              </p>
            </div>
          </div>
          <div>
            <h3>5) Swap Tokens(Exact Input & Exact Output)</h3>
            <div>
              <p>
                -{">"} User have to select the correct tokens and fee tier, only
                the pool which exists with that fees and tokens only swap will
                executes.
              </p>
              <p>
                -{">"} User can select the price slippage tolerance to swap the
                tokens within the selected price ranges, It is set by users to
                prevent trades from completing if market conditions or liquidity
                cause prices to deviate beyond this threshold.
              </p>
              <p>
                -{">"} User can swap tokens with exact input amount or exact
                output amount by jsut changing the input values.
              </p>
              <p>
                -{">"} Users can see the output amount they can get based on the
                current liquidity in the pool.
              </p>
              <p>
                -{">"} User have to enter the amount with the entier decimal of
                the token.{" "}
              </p>
              <p>
                -{">"} Example : If the Token-A decimal is 9, then usser want to
                swap 5 Token-A amount, then user want to enter 5_000_000_000 in
                input field, and out amount also displayed with the decimal
                values.
              </p>
              <p>
                -{">"} Swapping prices are calculated by charging fees of that
                respective pool with securely which makes avoild the rounding
                issues while calculating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
