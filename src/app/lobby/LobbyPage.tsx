import { useLocation } from "react-router-dom";
import BackgroundQuiz from "../../components/Trivia/BackgroundQuiz";
import { useEffect, useState } from "react";
import { Player } from "../../types/quiz/player";
import RoomCode from "../../components/Lobby/RoomCode";
import LoaderRoom from "../../components/Lobby/LoaderRoom";
import { socket } from "../../socket";
import PlayerName from "../../components/Lobby/PlayerName";
import { toastInformation } from "../../components/Sonner/sonner.toast";
import {
    quizDeletePlayer,
    quizJoinPlayer,
    quizSetInitial,
} from "../../store/features/quiz.slice";
import { useAppDispatch } from "../../store/hooks.redux";
import Loader from "../../components/Loader/Loader";

export default function LobbyPage() {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const collectionId = new URLSearchParams(location.search).get("collection");

    // Estado para verificar cuando esté cargando los necesario para el juego
    const [loading, setLoading] = useState<boolean>(true);

    const [roomCode, setRoomCode] = useState<number>();

    const [players, setPlayers] = useState<Array<Player>>([]);

    useEffect(() => {
        function roomCreated(code: number, socketId: string) {
            setTimeout(() => {
                dispatch(quizSetInitial({ code, socketId })); // guardo el codigo y el oscket id en el estado de la aplicacion
                setRoomCode(code); // guardo el codigo de la sala
                setLoading(false); // indico que ya no se está cargando
            }, 3000);
        }

        function joinPlayer(player: Player) {
            dispatch(quizJoinPlayer(player));
            setPlayers([...players, player]);
            toastInformation("Se ha unido " + player.name);
        }

        function playerDisconnected(player: Player) {
            const playersUpdated = players.filter(
                (p) => p.socketId !== player.socketId
            );

            setPlayers(playersUpdated);
            dispatch(quizDeletePlayer(player.socketId));

            toastInformation(`Se ha desconectado un jugador`);
        }

        socket.on("room:created", roomCreated);
        socket.on("room:join-player", joinPlayer);
        socket.on("room:player-disconnected", playerDisconnected);

        return () => {
            socket.off("room:created", roomCreated);
            socket.off("room:join-player", joinPlayer);
            socket.off("room:player-disconnected", playerDisconnected);
        };
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
                                <PlayerName player={p} key={p.socketId} />
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
                <main className="w-full h-screen flex justify-center items-center flex-col">
                    <Loader />
                </main>
            )}
        </BackgroundQuiz>
    );
}
