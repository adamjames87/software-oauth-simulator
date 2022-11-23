import {json, LoaderFunction} from "@remix-run/node";
import {useLoaderData, useMatches} from "@remix-run/react";
import axios from "axios";
import jwtDecode, {JwtPayload} from "jwt-decode";
import {Handle} from "~/components/breadcrumbs";
import {setToken} from "~/utils/tokenStore.server";




type TokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  "https://hasura.io/jwt/claims": Record<string, string>
}


const testToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZlY3RyaWMta2V5LWRldiJ9.eyJ1c2VyX25hbWUiOiJDb3JkZWxsMzJAZXhhbXBsZS5jb20iLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS11c2VyLWlkIjoiMjEiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXX0sInNjb3BlIjpbImZyZWVjbGlwYXJ0IiwibGljZW5jZSIsInRvb2xkYiJdLCJleHAiOjE2NTc3NDk2MzUsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiIwYjUwMjBkMS0xZmRjLTRiMDMtYmE3Mi1jMGM4MmRkOGZkNzgiLCJjbGllbnRfaWQiOiJBc3BpcmUifQ.gvf4bYZaFubmTbemN05SGHZiYIRO7XTy2omAUce1Vic9SoD5Dlm8MDkmPGIDF7qoLylHTtqr9PG5OCIDA6Cc2wEA6-oCIy1Ctpb4topaBXT7zzkrExLiZWKHYLc1ZnmCCbx7pQx-SXdiMcuXqBhtW4QSmS9oH16MqFa154WfZ6EmtJDCQGwv3QQyuzQtte267DB6XU-vynrOmvCbHo6Aj_ihbEdDAS71MPSa3N3Z-QmOHScvlCIsrA3r7bhqyg7dww6jRYQ26DM7xFnMI-nwGDVKVaiFiqOlq6c-Q2EhbbWrz49l1H3sU_zza6EhlWp4U7u7k9Xe-SmMpovU6pcjTQ`

type LoaderData = {
  code?: string | null,
  accessToken?: string | null,
  decoded?: JwtPayload | null
}
export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")

  let accessToken = testToken;
  try {
    const forwardUrl = new URL("http://localhost:3000/oauth/token")
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code")
    params.set("clientId", "Aspire")
    params.set("code", code as string);
    params.set("redirect_uri", "http://localhost:5050/oauth/complete")
    const result = await axios.post<TokenResponse>(forwardUrl.href, params, {
      auth: {
        username: "Aspire",
        password: "kqa7326ikx3he87ndv"
      }
    })
    accessToken = result.data.access_token;
    const claims = result.data["https://hasura.io/jwt/claims"];
    setToken(parseInt(claims["x-hasura-user-id"]), accessToken);
  } catch (e) {

  }
  const decoded = jwtDecode<JwtPayload>(accessToken , {});
  return json<LoaderData>({code: code, accessToken: accessToken, decoded: decoded})
}


export const handle: Handle = {
  breadcrumbs: ({params}) => {
    const customerId = params.id
    return [
      {to: `/customers/list`, title: "All Customers"},
      {to: `/customers/${customerId}`, title: `${customerId}`}
    ]
  }
}


export default function RunTests(): JSX.Element {
  const {code, accessToken, decoded} = useLoaderData<LoaderData>();
  return (
    <div className="grid grid-cols-2 space-x-4 py-6">
      <div className="space-y-4">
        {code && (
          <div className="p-6 text-center border border-green-500 bg-green-50 rounded shadow">
            Received authorization code {code}. Exchanging for token...
          </div>
        )}
        {accessToken && (
          <div className="p-6  border border-gay-500  rounded shadow space-y-4">
            <h3 className="font-semibold text-center">
              Fetched access token.
            </h3>
            <div className="break-all font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200">
              {accessToken}
            </div>
            <h3 className="font-semibold text-center">
              Decoded
            </h3>
            <pre className="break-all font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
            {JSON.stringify(decoded,null,2)}
          </pre>
          </div>
        )}
        {!accessToken && (
          <div className="bg-red-50 border-red-500 rounded text-center p-6 border">
            Unable to retrieve access token from response
            <div>
              <a>
                Retry
              </a>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="border border-gray-200 rounded p-2">
          <h3 className="text-center font-semibold">Perform a Request</h3>
          <div className="p-4 text-sm text-center">
            This will perform the request as this user, using the given token. Check that
            the token has a valid date if the request fails.
          </div>
          <form action="">
            <div className="flex items-center space-x-2">
              <select name="" id="" className="rounded border border-gray-300 w-1/2">
                <option value="AccessAspire">Access Aspire Licence</option>
                <option value="AccessAspire">Access VCarve Pro Licence</option>
                <option value="AccessAspire">Access VCarve Desktop Licence</option>
                <option value="AccessAspire">Access Cut2D Pro Licence</option>
                <option value="AccessAspire">Access Cut2D Desktop Licence</option>
              </select>
              <button className="bg-blue-500 text-white p-2 rounded">Make Request</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
