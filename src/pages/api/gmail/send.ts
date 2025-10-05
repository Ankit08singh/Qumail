// pages/api/gmail/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function makeRawEmail(to: string, from: string, subject: string, body: string) {
  const str = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body
  ].join("\r\n");

  // base64url
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { to, subject, message } = req.body;
  const accessToken = (session as any).accessToken;
  const from = session.user?.email;

  if (!accessToken || !from) return res.status(400).json({ error: "Missing token or user email" });

  const raw = makeRawEmail(to, from, subject, message);

  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}
