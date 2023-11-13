import { useLocation } from "react-router-dom";
import BackgroundQuiz from "../../components/Trivia/BackgroundQuiz";
import { useEffect, useState } from "react";
import { Player } from "../../types/quiz/player";
import RoomCode from "../../components/Lobby/RoomCode";
import LoaderRoom from "../../components/Lobby/LoaderRoom";
import { socket } from "../../socket";
import PlayerName from "../../components/Lobby/PlayerName";

export default function LobbyPage() {
    const location = useLocation();
    const collectionId = new URLSearchParams(location.search).get("collection");

    // Estado para verificar cuando esté cargando los necesario para el juego
    const [loading, setLoading] = useState<boolean>(true);

    const [roomCode, setRoomCode] = useState<number>();

    const [players, setPlayers] = useState<Array<Player>>([]);

    useEffect(() => {
        socket.on("room:created", (code) => {
            setTimeout(() => {
                setRoomCode(code); // guardo el codigo de la sala
                setLoading(false); // indico que ya no se está cargando
            }, 3000);
        });
    });

    return (
        <BackgroundQuiz>
            {!loading && (
                <main className="w-full h-screen flex flex-col items-center justify-start gap-36 p-20 md:px-44">
                    {/** Mostrar el código de juego */}
                    {roomCode && <RoomCode code={roomCode} />}

                    {/** Mostrar los jugadores que van ingresando a la sala */}
                    {players.length > 0 && !loading && (
                        <section className="w-full grid grid-cols-5 gap-12">
                            {players.map((p) => (
                                <PlayerName player={p} />
                            ))}
                        </section>
                    )}

                    {/** Mostrar dialogo de espera de jugadores en la sala */}
                    {players.length == 0 && !loading && (
                        <LoaderRoom text="Esperando jugadores" />
                    )}
                </main>
            )}
            {loading && (
                <main className="w-full h-screen flex justify-center items-center">
                    <LoaderRoom text="Cargando" />
                </main>
            )}
        </BackgroundQuiz>
    );
}
