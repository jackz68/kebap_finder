import InfoPanel from "./panels/InfoPanel";
import MapPanel from "./panels/MapPanel";
import ChatPanel from "./panels/ChatPanel";

export default function MainLayout({ messages, onSendMessage, isProcessing, mapLocation, mapStatus, onMapClick, countryOptionsText, nearbyAnswer, placesStatus, placesError, onPlaceSelect, placeLookupStatus, placeLookupMessage }) {
  return (
    <main className="w-full flex-1 min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 items-stretch md:h-[calc(100svh-4rem)] md:min-h-0">
        <section className="h-[65svh] min-h-[20rem] md:h-full md:min-h-0">
          <InfoPanel
            answer={nearbyAnswer}
            status={placesStatus}
            error={placesError}
            onPlaceSelect={onPlaceSelect}
            placeLookupStatus={placeLookupStatus}
            placeLookupMessage={placeLookupMessage}
          />
        </section>
        <section className="h-[65svh] min-h-[20rem] md:h-full md:min-h-0">
          <MapPanel location={mapLocation} status={mapStatus} onMapClick={onMapClick} />
        </section>
        <section className="h-[65svh] min-h-[20rem] md:h-full md:min-h-0">
          <ChatPanel messages={messages} onSend={onSendMessage} isLoading={isProcessing} countryOptionsText={countryOptionsText} />
        </section>
      </div>
    </main>
  );
}
