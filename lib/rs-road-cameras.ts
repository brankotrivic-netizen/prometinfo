// SAMODEJNO ZAJETO: Putevi Srbije cestne/cestninske kamere (kamere.toll4all.com).
// poster = javna JPEG slika kamere (osvezuje se); stream = HLS (referer-zaklenjen, brez vgradnje).
export interface RsRoadCam { name: string; poster: string; stream: string | null; lat: number | null; lng: number | null }
export const RS_ROAD_CAMS: RsRoadCam[] = [
 {
  "name": "Dimitrovgrad Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam17/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam17/index.m3u8",
  "lat": 43.01574,
  "lng": 22.7782
 },
 {
  "name": "Dimitrovgrad Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam18/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam18/index.m3u8",
  "lat": 43.01574,
  "lng": 22.7782
 },
 {
  "name": "Obrenovac Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam3/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam3/index.m3u8",
  "lat": 44.65483,
  "lng": 20.20143
 },
 {
  "name": "Obrenovac Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam4/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam4/index.m3u8",
  "lat": 44.65483,
  "lng": 20.20143
 },
 {
  "name": "Preševo Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam19/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam19/index.m3u8",
  "lat": 42.30952,
  "lng": 21.64901
 },
 {
  "name": "Preševo Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam20/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam20/index.m3u8",
  "lat": 42.30952,
  "lng": 21.64901
 },
 {
  "name": "Prilipac Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam21/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam21/index.m3u8",
  "lat": 43.81833,
  "lng": 20.11489
 },
 {
  "name": "Prilipac Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam22/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam22/index.m3u8",
  "lat": 43.81833,
  "lng": 20.11489
 },
 {
  "name": "Ruma Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam7/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam7/index.m3u8",
  "lat": 45.00783,
  "lng": 19.81878
 },
 {
  "name": "Ruma Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam8/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam8/index.m3u8",
  "lat": 45.00783,
  "lng": 19.81878
 },
 {
  "name": "Stara Pazova Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam1/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam1/index.m3u8",
  "lat": 44.98461,
  "lng": 20.15888
 },
 {
  "name": "Stara Pazova Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam2/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam2/index.m3u8",
  "lat": 44.98461,
  "lng": 20.15888
 },
 {
  "name": "Subotica Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam15/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam15/index.m3u8",
  "lat": 46.10021,
  "lng": 19.66533
 },
 {
  "name": "Subotica Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam16/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam16/index.m3u8",
  "lat": 46.10021,
  "lng": 19.66533
 },
 {
  "name": "Šabac Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam9/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam9/index.m3u8",
  "lat": 44.75715,
  "lng": 19.6954
 },
 {
  "name": "Šabac Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam10/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam10/index.m3u8",
  "lat": 44.75715,
  "lng": 19.6954
 },
 {
  "name": "Šid Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam13/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam13/index.m3u8",
  "lat": 45.12771,
  "lng": 19.22716
 },
 {
  "name": "Šid Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam14/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam14/index.m3u8",
  "lat": 45.12771,
  "lng": 19.22716
 },
 {
  "name": "Šimanovci Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam11/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam11/index.m3u8",
  "lat": 44.87451,
  "lng": 20.08911
 },
 {
  "name": "Šimanovci Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam12/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam12/index.m3u8",
  "lat": 44.87451,
  "lng": 20.08911
 },
 {
  "name": "Vrba Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam23/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam23/index.m3u8",
  "lat": 43.69182,
  "lng": 20.78397
 },
 {
  "name": "Vrba Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam24/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam24/index.m3u8",
  "lat": 43.69182,
  "lng": 20.78397
 },
 {
  "name": "Vrčin Izlaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam5/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam5/index.m3u8",
  "lat": 44.66396,
  "lng": 20.59102
 },
 {
  "name": "Vrčin Ulaz",
  "poster": "https://cam.bitinfo.co.rs/front_pan_cam6/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/front_pan_cam6/index.m3u8",
  "lat": 44.66396,
  "lng": 20.59102
 },
 {
  "name": "Leskovac Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam1/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam1/index.m3u8",
  "lat": 42.99513,
  "lng": 21.94643
 },
 {
  "name": "Leskovac Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam2/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam2/index.m3u8",
  "lat": 42.99513,
  "lng": 21.94643
 },
 {
  "name": "Niš Sever Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam3/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam3/index.m3u8",
  "lat": 43.34891,
  "lng": 21.85651
 },
 {
  "name": "Niš Sever Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam4/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam4/index.m3u8",
  "lat": 43.34891,
  "lng": 21.85651
 },
 {
  "name": "Niš Jug Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam5/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam5/index.m3u8",
  "lat": 43.32719,
  "lng": 21.81052
 },
 {
  "name": "Niš Jug Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam6/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam6/index.m3u8",
  "lat": 43.32719,
  "lng": 21.81052
 },
 {
  "name": "Novi Sad Jug Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam13/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam13/index.m3u8",
  "lat": 45.27771,
  "lng": 19.91624
 },
 {
  "name": "Novi Sad Jug Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam14/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam14/index.m3u8",
  "lat": 45.27771,
  "lng": 19.91624
 },
 {
  "name": "Pakovraće Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam11/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam11/index.m3u8",
  "lat": 43.89928,
  "lng": 20.26063
 },
 {
  "name": "Pakovraće Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam12/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam12/index.m3u8",
  "lat": 43.89928,
  "lng": 20.26063
 },
 {
  "name": "Požarevac Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam7/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam7/index.m3u8",
  "lat": 44.61999,
  "lng": 21.1854
 },
 {
  "name": "Požarevac Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam8/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam8/index.m3u8",
  "lat": 44.61999,
  "lng": 21.1854
 },
 {
  "name": "Smederevo Izlaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam9/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam9/index.m3u8",
  "lat": 44.6651,
  "lng": 20.92711
 },
 {
  "name": "Smederevo Ulaz",
  "poster": "https://jpps.bitinfo.co.rs/side_pan_cam10/index.jpg",
  "stream": "https://cam.bitinfo.co.rs/side_pan_cam10/index.m3u8",
  "lat": 44.6651,
  "lng": 20.92711
 }
];
