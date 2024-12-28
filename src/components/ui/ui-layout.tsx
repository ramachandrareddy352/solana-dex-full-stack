"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AccountChecker } from "../data-access/account-ui";
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";
import {
  GithubOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  MailOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <div className="navbar bg-base-300 text-neutral-content flex-col md:flex-row space-y-2 md:space-y-0 fixed">
        <div className="flex-1">
          <Link
            className="btn btn-ghost normal-case text-xl mx-5"
            href="/"
            style={{ marginLeft: "100px", marginRight: "50px" }}
          >
            <b>RCR-DEX</b>
          </Link>
          <ul className="menu menu-horizontal px-1 space-x-2">
            {links.map(({ label, path }) => (
              <li key={path}>
                <Link
                  className={pathname.startsWith(path) ? "active" : ""}
                  href={path}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-none space-x-2">
          <WalletButton />
          <ClusterUiSelect />
        </div>
      </div>
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow mx-4 lg:mx-auto" style={{ marginTop: "70px" }}>
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-3">
        <aside className="flex justify-around" style={{ width: "50%" }}>
          <p>
            <a
              className="link hover:text-white"
              href="https://github.com/ramachandrareddy352/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubOutlined />
              <b>&nbsp;Github</b>
            </a>
          </p>
          <p>
            <a
              className="link hover:text-white"
              href="mailto:rcrtavanam@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MailOutlined />
              <b>&nbsp;E-Mail</b>
            </a>
          </p>
          <p>
            <a
              className="link hover:text-white"
              href="https://www.linkedin.com/in/ramachandratavanam/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedinOutlined />
              <b>&nbsp;LinkedIn</b>
            </a>
          </p>
          <p>
            <a
              className="link hover:text-white"
              href="https://x.com/TavanamRama"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterOutlined />
              <b>&nbsp;Twitter</b>
            </a>
          </p>
          <p>
            <a
              className="link hover:text-white"
              href="https://ramachandrareddy.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlobalOutlined />
              <b>&nbsp;Portfolio</b>
            </a>
          </p>
        </aside>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
