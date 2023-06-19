mod error;
mod local_track;
use error::ScannerError;
use id3::{Tag, TagLike};
use neon::prelude::*;
use std::{collections::LinkedList, error::Error};

use local_track::LocalTrack;

fn visitFile(path: String) -> Result<LocalTrack, ScannerError> {
    let tag = Tag::read_from_path(&path);

    match tag {
        Ok(tag) => Ok(LocalTrack {
            artist: Some(tag.artist().unwrap_or("no artist").to_string()),
            title: Some(tag.title().unwrap_or("no title").to_string()),
            album: Some(tag.album().unwrap_or("no album").to_string()),
            filename: path.clone(),
            path: path.clone(),
        }),
        Err(e) => Err(ScannerError {
            message: format!("Error reading file: {}", e),
        }),
    }
}

fn visitDirectory(
    path: String,
    supportedFormats: Vec<String>,
    dirsToScanQueue: &mut LinkedList<String>,
    filesToScanQueue: &mut LinkedList<String>,
) {
    // Read the contents of the directory
    let dir = std::fs::read_dir(path.clone()).unwrap();
    for entry in dir {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_dir() {
            // Add the directory to the queue
            dirsToScanQueue.push_back(path.to_str().unwrap().to_string());
        } else if let Some(extension) = path.extension().and_then(|ext| ext.to_str()) {
            // Add the file to the queue, if it's a supported format
            if supportedFormats.contains(&extension.to_string()) {
                filesToScanQueue.push_back(path.to_str().unwrap().to_string());
            }
        }
    }
}

fn scanFolders(mut cx: FunctionContext) -> JsResult<JsArray> {
    let folders: Handle<JsArray> = cx.argument(0)?;
    let supported_formats: Handle<JsArray> = cx.argument(1)?;
    let onProgressCallback: Handle<JsFunction> = cx.argument(2)?;
    let result: Handle<JsArray> = cx.empty_array();

    // Copy all the starting folders to a queue, which holds all the folders left to scan
    let supported_formats_vec = supported_formats
        .to_vec(&mut cx)?
        .into_iter()
        .map(|format| format.to_string(&mut cx).unwrap().value(&mut cx))
        .collect::<Vec<String>>();
    let folders_vec = folders.to_vec(&mut cx)?;
    let mut dirsToScanQueue: LinkedList<String> = LinkedList::new();
    let mut filesToScanQueue: LinkedList<String> = LinkedList::new();
    let mut totalFilesToScanNum = 0;
    for folder in folders_vec {
        let folder_string = folder.to_string(&mut cx)?.value(&mut cx);
        dirsToScanQueue.push_back(folder_string);
    }

    // While there are still folders left to scan
    while !dirsToScanQueue.is_empty() {
        // Get the next folder to scan
        let folder = dirsToScanQueue.pop_front().unwrap();

        // Scan the folder
        visitDirectory(
            folder.clone(),
            supported_formats_vec.clone(),
            &mut dirsToScanQueue,
            &mut filesToScanQueue,
        );

        // Call the progress callback
        let this = cx.undefined();
        let args = vec![
            cx.number(0).upcast(),
            cx.number(filesToScanQueue.len() as f64).upcast(),
            cx.string(folder.clone()).upcast(),
        ];
        onProgressCallback.call(&mut cx, this, args)?;
    }

    // All folders have been scanned, now scan the files
    totalFilesToScanNum = filesToScanQueue.len();
    while !filesToScanQueue.is_empty() {
        // Get the next file to scan
        let file = filesToScanQueue.pop_front().unwrap();

        // Scan the file
        let track = visitFile(file.clone()).unwrap();
        let len = result.len(&mut cx);
        let track_js_object = JsObject::new(&mut cx);
        let track_artist_js_string = cx.string(track.artist.unwrap_or("".to_string()));
        track_js_object.set(&mut cx, "artist", track_artist_js_string)?;

        let track_title_js_string = cx.string(track.title.unwrap_or("".to_string()));
        track_js_object.set(&mut cx, "title", track_title_js_string)?;

        let track_album_js_string = cx.string(track.album.unwrap_or("".to_string()));
        track_js_object.set(&mut cx, "album", track_album_js_string)?;

        let track_filename_js_string = cx.string(track.filename);
        track_js_object.set(&mut cx, "filename", track_filename_js_string)?;

        let track_path_js_string = cx.string(track.path);
        track_js_object.set(&mut cx, "path", track_path_js_string)?;

        result.set(&mut cx, len, track_js_object)?;
        println!("Scanned file: {}", file);

        // Call the progress callback
        let this = cx.undefined();
        let args = vec![
            cx.number((totalFilesToScanNum - filesToScanQueue.len()) as f64)
                .upcast(),
            cx.number(totalFilesToScanNum as f64).upcast(),
            cx.string(file.clone()).upcast(),
        ];
        onProgressCallback.call(&mut cx, this, args)?;
    }

    Ok(result)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("scanFolders", scanFolders)?;
    Ok(())
}
