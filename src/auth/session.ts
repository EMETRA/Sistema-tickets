import { NextRequest } from "next/server";

export type Session = {
    token: string;
};

export function getSessionFromRequest( request: NextRequest ): Session | null {

    const token = request.cookies.get('access_token')?.value;

    if (!token) return null;

    return { token };

};