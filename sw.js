// Name Of Cache Storage.
const cacheName = "DEV-HUB-v1";


// All Files I Want To Storage In The Cache Storage.
const assets =[
    '/',
    '/index.html',
    '/about.html',
    '/course.html',
    '/css/style.css',
    '/css/bootstrap.css',
    '/js/script.js',
    '/js/bootstrap.js',
    '/js/popper.min.js',
    '/js/jquery-3.6.0.min.js',
    '/img/cover.png',
    '/img/cover2.jpg',
    '/img/icon.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css?family=Roboto+Slab:400,700|Roboto:300,400,400i,500,700',
    'https://use.fontawesome.com/releases/v6.1.0/js/all.js'
]


// Event: Installation ==> Installing files (assets) into cache Storage.
self.addEventListener('install', (installEvent) =>{
    installEvent.waitUntil(
        caches.open(cacheName).then((cache) => {
            cache.addAll(assets).then().catch()
        })
        .catch((err) => {})
    )
})

// Event: Activated ==> cleans any old cache and adds the latest update to the cache staroge.
self.addEventListener("activate", (activateEvent) => {
    activateEvent.waitUntil(
        caches.keys().then((keys) => {
            keys.filter((key) => key != cacheName)
            .map((key) => caches.delete(key))
        })
    )
})

// Event: Fetched ==> It fetches the files stored in the cache to be used in the event of a network failure (Offline).
self.addEventListener('fetch', (fetchEvent) => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then((res) => {
            return res || fetch(fetchEvent.request);
        })
    )
})