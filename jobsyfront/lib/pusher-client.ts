// import Pusher from 'pusher-js';

// const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
//   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//   forceTLS: true,
// });

// export default pusher;

// lib/pusher-client.ts

let pusherInstance: any = null;

export const getPusherClient = async () => {
  // Sécurité : si on est sur le serveur, on stoppe immédiatement
  if (typeof window === 'undefined') return null;

  // Si l'instance existe déjà, on la retourne
  if (pusherInstance) return pusherInstance;

  try {
    // IMPORT DYNAMIQUE : Node.js va ignorer cette ligne à la compilation
    const { default: Pusher } = await import('pusher-js');
    
    const PusherConstructor = (Pusher as any).default || Pusher;

    pusherInstance = new PusherConstructor(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });

    return pusherInstance;
  } catch (error) {
    console.error("Erreur lors de l'initialisation dynamique de Pusher:", error);
    return null;
  }
}