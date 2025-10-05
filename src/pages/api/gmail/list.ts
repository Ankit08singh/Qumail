// pages/api/gmail/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const accessToken = (session as any).accessToken;
  if (!accessToken) return res.status(400).json({ error: "No access token" });

  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}
