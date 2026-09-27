// Licensed under the MIT licence, see /licences/MIT.txt

"use strict";

// Ads live next to this frame, in ../ads/. Image paths in ads.json are
// relative to that file.
const DATA = new URL("../ads/ads.json", location.href);

const isHttps = url => {
	try { return new URL(url).protocol === "https:"; } catch { return false; }
};

// Only images served from this site. The _headers CSP enforces the
// same rule in the browser.
const localImage = path => {
	const url = new URL(path, DATA);
	if (url.origin !== location.origin) {
		throw new Error("remote image: " + path);
	}
	return url.href;
};

const fail = err => {
	console.error("ploughboy ads:", err);
	const msg = document.getElementById("msg");
	const info = document.getElementById("info");
	msg.textContent = "No ad here. If an ad blocker hid this, Ploughboy " +
		"ads don't track you, so it's safe to allow.";
	msg.hidden = false;
	info.hidden = false;
};

function show(ad) {
	const link = document.getElementById("ad");
	const info = document.getElementById("info");
	const img = document.createElement("img");
	img.src = localImage(ad.image);
	img.alt = ad.alt;
	img.addEventListener("load", () => {
		link.hidden = false;
		info.hidden = false;
	});
	img.addEventListener("error", fail);

	link.append(img);
	link.href = ad.link;
}

fetch(DATA)
	.then(res => {
		if (!res.ok) {
			throw new Error("HTTP " + res.status + " for " + DATA.pathname);
		}
		return res.json();
	})
	.then(ads => {
		const usable = ads.filter(ad =>
			ad && isHttps(ad.link) && ad.alt && typeof ad.image === "string");
		if (!usable.length) {
			throw new Error("no usable ads in " + DATA.pathname);
		}
		show(usable[Math.floor(Math.random() * usable.length)]);
	})
	.catch(fail);
