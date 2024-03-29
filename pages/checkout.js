import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useSelector } from "react-redux";
import CheckoutProduct from "../components/CheckoutProduct";
import Header from "../components/Header";
import { selectItems, selectTotal } from "../slices/basketSlice";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

function Checkout() {
  const session = useSession();
  const items = useSelector(selectItems);
  const total = useSelector(selectTotal);
  console.log("total is", total);
  console.log("session in checkout", session);

async function createCheckoutSession(){
  const stripe = await stripePromise

  // Call the backend to create a checkout session
  const checkoutSession = await axios.post('/api/create-checkout-session', {
    items,
    email: session?.data?.user?.email,
  })

  // Redirect the user to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: checkoutSession.data.id
  })

  if(result.error) {
   console.error("stripe error", result.error.message)
  }

}

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="lg:flex max-w-screen-2xl mx-auto">
        {/* Left Section */}
        <div className="flex-grow m-5 shadow-sm">
          <Image
            src="https://links.papareact.com/ikj"
            alt=""
            width={1020}
            height={250}
            objectFit="contain"
          />
          <div className="flex flex-col p-5 gap-10 bg-white">
            <h1 className="text-3xl border-b pb-4">
              {items.length === 0
                ? "Your Amazon basket is empty"
                : "Shopping Basket"}
            </h1>

            {items.map((item, i) => (
              <CheckoutProduct key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col bg-white p-10 shadow-md">
          {items.length > 0 && (
            <>
              <h2 className="whitespace-nowrap">
                Subtotal {items.length} items:{" "}
                <span className="font-bold">$ {total}</span>
              </h2>
              <button role='link' onClick={createCheckoutSession}
                disabled={session?.status === "unauthenticated"}
                className={`button mt-2 ${
                  session?.status === "unauthenticated" &&
                  "from-gray-600 to-gray-400 border border-gray-200 text-gray-200 cursor-not-allowed"
                }`}
              >
                {session?.status === "unauthenticated"
                  ? "Sign in to checkout"
                  : "Proceed to checkout"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
export default Checkout;
