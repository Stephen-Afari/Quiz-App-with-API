export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGVtb3JnYW5hZmFyaSIsImEiOiJjbDhoYWo0dzcwbTFpM25tbDE4bHR3YmpqIn0.4UPqXQiBGNAZW_e3t6N9FA';
  //a
  var map = new mapboxgl.Map({
    container: 'map',
    scrollZoom: false,
    style: 'mapbox://styles/demorganafari/cl8harxby001315o91wm6k072',
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //extend the map bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
