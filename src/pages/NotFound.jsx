import { Link } from "react-router-dom";
import { Flower2 } from "lucide-react";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60svh] place-items-center py-20 text-center">
      <div className="grid justify-items-center gap-4">
        <Flower2 className="size-12 text-gold" />
        <h1 className="text-5xl">This page has wilted</h1>
        <p className="max-w-sm text-[15px] text-mute">The link may be old or the piece may have been removed. Browse what is in bloom right now.</p>
        <Button as={Link} to="/shop" size="lg">Back to shop</Button>
      </div>
    </div>
  );
}
