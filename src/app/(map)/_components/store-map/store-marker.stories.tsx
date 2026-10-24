import type { Store } from "../../../../types/stores-data";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Map as LeafletMap } from "leaflet";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { MapContainer } from "react-leaflet";
import { expect, fireEvent, fn, waitFor } from "storybook/test";
import { SelectedStorePopup } from "./selected-store-popup";
import { StoreMarker } from "./store-marker";
import { useSelectedStore } from "../../_hooks/use-selected-store";

const STORE: Store = {
  id: "197",
  name: "アトレ吉祥寺店",
  address: "東京都武蔵野市吉祥寺南町1-1-24",
  lat: 35.7033,
  lng: 139.5797,
  url: "https://example.com",
  services: [],
  sales: [],
};

const NuqsAdapter = withNuqsTestingAdapter({ hasMemory: true });

// Records the map's synthetic preclick, which closes any open popup
const onMapPreclick = fn();

// Module-level so re-renders hand Leaflet the same listener, which it ignores
function recordPreclick() {
  onMapPreclick();
}

function spyOnPreclick(map: LeafletMap | null) {
  map?.on("preclick", recordPreclick);
}

// Wires the marker to the popup through `?store=` the way StoreMap does,
// without tiles so the story doesn't hit the network
function MarkerWithPopup({ store, color }: { store: Store; color: string }) {
  const { storeId } = useSelectedStore();

  return (
    <MapContainer
      ref={spyOnPreclick}
      center={store}
      zoom={16}
      style={{ width: 480, height: 360 }}
    >
      <StoreMarker store={store} color={color} />
      {storeId === store.id ? (
        <SelectedStorePopup key={store.id} store={store} />
      ) : null}
    </MapContainer>
  );
}

const meta = {
  component: StoreMarker,
  args: { store: STORE, color: "#dc2626" },
  decorators: [
    (Story) => (
      <NuqsAdapter>
        <Story />
      </NuqsAdapter>
    ),
  ],
  render: (args) => <MarkerWithPopup {...args} />,
} satisfies Meta<typeof StoreMarker>;

export default meta;

type Story = StoryObj<typeof StoreMarker>;

function getElement(canvasElement: HTMLElement, selector: string) {
  const element = canvasElement.querySelector(selector);

  if (element === null) {
    throw new Error(`${selector} is not rendered`);
  }

  return element;
}

// userEvent sends no usable coordinates, and Leaflet turns them into a LatLng,
// so click at a real point on screen (the element's center, or an offset)
async function clickAt(element: Element, offset?: { x: number; y: number }) {
  const rect = element.getBoundingClientRect();

  const coords = {
    clientX: rect.left + (offset?.x ?? rect.width / 2),
    clientY: rect.top + (offset?.y ?? rect.height / 2),
  };

  await fireEvent.click(element, coords);
}

export const ClickOpensPopup: Story = {
  play: async ({ canvas, canvasElement }) => {
    await clickAt(getElement(canvasElement, "path.leaflet-interactive"));

    // Leaflet fades popups in
    await waitFor(async () => {
      await expect(
        canvas.getByRole("heading", { name: STORE.name })
      ).toBeVisible();
    });
  },
};

export const ClickStaysOffTheMap: Story = {
  play: async ({ canvasElement }) => {
    onMapPreclick.mockClear();

    // The selected store's popup isn't bound to the marker, so a preclick
    // reaching the map would close it even when its own marker is clicked
    await clickAt(getElement(canvasElement, "path.leaflet-interactive"));

    await expect(onMapPreclick).not.toHaveBeenCalled();

    // A click on the bare map still reaches it, which closes popups as usual
    await clickAt(getElement(canvasElement, ".leaflet-container"), {
      x: 20,
      y: 20,
    });

    await expect(onMapPreclick).toHaveBeenCalledOnce();
  },
};
