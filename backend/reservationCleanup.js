import {  GolfClub, ReservedProduct } from "./scheman.js";

export function handleExpiredReservations() {
  setInterval(async () => {
    const now = new Date();

    try {
      // Hitta alla utgångna reservationer
      const expiredReservations = await ReservedProduct.find({
        expiresAt: { $lte: now },
      });

      // Hantera varje utgången reservation
      for (const reservation of expiredReservations) {
        const club = await GolfClub.findById(reservation.clubId);
        if (club) {
          club.quantity += 1;
          await club.save();
        }

        // Ta bort den utgångna reservationen
        await ReservedProduct.findByIdAndDelete(reservation._id);
        console.log("reservation", reservation._id, "deleted");
      }
    } catch (error) {
      console.error("Error handling expired reservations:", error);
    }
  }, 60000); 
}
