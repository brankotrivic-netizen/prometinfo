-- PrometInfo: zgodovina cakanj (osebna vozila), en zapis na prehod na 15 min.
-- s = smer JUG (tja, iz HR/SI proti BiH/RS), n = smer SEVER (nazaj); minute.
-- g: bit 1 = s je le splosna ocena ("do 30 min"), bit 2 = n je le splosna ocena.
-- dw/hr = lokalni dan v tednu (0=ned) in ura (Europe/Ljubljana) ob meritvi.
CREATE TABLE IF NOT EXISTS w (i TEXT NOT NULL, t INTEGER NOT NULL, dw INTEGER NOT NULL, hr INTEGER NOT NULL, s INTEGER, n INTEGER, g INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS w_it ON w (i, t);
