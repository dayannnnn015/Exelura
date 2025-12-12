import React, { useState } from "react";
import CheckoutPopover from "./CheckoutPopover";
import MyPurchaseDialog from "./MyPurchaseDialog";
import { useUserStore } from "../store/userStore";

const PurchaseFlow: React.FC = () => {
  const { cart, checkoutSelectedItems } = useUserStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const handleCheckoutSuccess = () => {
    checkoutSelectedItems();
    setCheckoutOpen(false);
    setPurchaseDialogOpen(true);
  };

  return (
    <>
      <button onClick={() => setCheckoutOpen(true)}>Go to Checkout</button>

      <CheckoutPopover
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedItems={cart}
        selectedTotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <MyPurchaseDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
      />
    </>
  );
};

export default PurchaseFlow;
