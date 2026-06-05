// SAMODEJNO ZAJETO: BIHAMK kamere mejnih prehodov (GP) (BiH, video-nadzor.bihamk.ba). Javne JPEG slike (osvezujejo se).
export interface BihCam { name: string; image: string; lat: number | null; lng: number | null }
export const BIHAMK_CAMS: BihCam[] = [
 {
  "name": "GP Orašje - izlaz iz BIH",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/ORASJE.jpg",
  "lat": 45.03,
  "lng": 18.69
 },
 {
  "name": "GP Kamensko",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/KAMENSKO.jpg",
  "lat": 43.65,
  "lng": 16.86
 },
 {
  "name": "GP Crveni Grm",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/CRVENIGRM.jpg",
  "lat": 43.2,
  "lng": 17.65
 },
 {
  "name": "GP Brod - Izlaz iz BiH",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/BROD2.jpg",
  "lat": 45.143,
  "lng": 17.993
 },
 {
  "name": "GP Brod - Ulaz u BiH",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/BROD1.jpg",
  "lat": 45.139,
  "lng": 17.988
 },
 {
  "name": "GP Šepak (Šepak-Loznica)",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/SEPAK.jpg",
  "lat": 44.55,
  "lng": 19.18
 },
 {
  "name": "GP Doljani - ulaz u BIH",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/DOLJANI.jpg",
  "lat": 43.02,
  "lng": 17.55
 },
 {
  "name": "GP Prisika (Aržano)",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/PRISIKA.jpg",
  "lat": 43.45,
  "lng": 17.28
 },
 {
  "name": "GP Bijača",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/BIJACA.jpg",
  "lat": 43.17,
  "lng": 17.49
 },
 {
  "name": "GP Izačić",
  "image": "https://video-nadzor.bihamk.ba/videosurveillence/IZACIC.jpg",
  "lat": 44.85,
  "lng": 15.78
 }
];
