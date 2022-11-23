const authUrl =  new URL("http://localhost:8080/oauth/authorize")
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", "Aspire");
authUrl.searchParams.set("redirect_uri", "http://localhost:5050/callback");
authUrl.searchParams.set("scope", "licence+freeclipart+tooldb")

// http://localhost:8080/oauth/authorize?response_type=code&client_id=Aspire&redirect_uri=http%3A%2F%2Flocalhost%3A5050%2Foauth%2Fcallback&scope=licence,freeclipart,tooldb

function Spacer(): JSX.Element {
  return (
    <div className="h-4"></div>
  )
}



export default function Index() {
  return (
    <div className="container mx-auto">

      <h2 className="font-semibold text-2xl my-2">Step 1: Click to login</h2>
      <Spacer></Spacer>
      <div className="flex flex-row space-x-4">
        <a className="bg-aspire text-white rounded p-2 " href={authUrl.href}>Simulate Aspre Login</a>
      </div>
    </div>
  );
}
