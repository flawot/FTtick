use std::io::Cursor;
use rodio::{Decoder, DeviceSinkBuilder, Player};

pub fn play_alarm() {
    std::thread::spawn(move || {
        let mut handle = match DeviceSinkBuilder::open_default_sink() {
            Ok(h) => h,
            Err(e) => {
                eprintln!("Audio error [open_default_sink]: {:?}", e);
                return;
            }
        };
        handle.log_on_drop(false);

        let player = Player::connect_new(handle.mixer());

        let audio_data = include_bytes!("../assets/break.wav");
        let cursor = Cursor::new(audio_data);

        let source = match Decoder::new(cursor) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Audio error [Decoder::new]: {:?}", e);
                return;
            }
        };

        player.append(source);
        player.sleep_until_end();
    });
}