// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fs;
use std::io::{Read, Write};

#[derive(Debug, Serialize, Deserialize)]
struct AppConfig {
    anthropic_api_key: String,
    system_prompt: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn load_app_config() -> serde_json::Value {
    if let Some(proj_dirs) = ProjectDirs::from("jp", "techtalk", "clip-translator") {
        let config_path = proj_dirs.config_dir().join("clip-translator.json");
        if let Ok(mut file) = fs::File::open(config_path) {
            let mut contents = String::new();
            if file.read_to_string(&mut contents).is_ok() {
                return serde_json::from_str(&contents).unwrap_or(serde_json::json!(null));
            }
        }
    }
    serde_json::json!(null)
}

#[tauri::command]
fn save_app_config(config: serde_json::Value) -> Result<(), String> {
    if let Some(proj_dirs) = ProjectDirs::from("jp", "techtalk", "clip-translator") {
        // プロジェクトディレクトリ内の設定ファイルパス
        let config_path = proj_dirs.config_dir().join("clip-translator.json");

        // プロジェクトディレクトリが存在するか確認し、存在しない場合は作成
        if !proj_dirs.config_dir().exists() {
            fs::create_dir_all(proj_dirs.config_dir()).map_err(|e| e.to_string())?;
        }

        // 設定ファイルを開く（ない場合は作成）
        let mut file = fs::File::create(config_path).map_err(|e| e.to_string())?;

        // JSONデータを文字列としてファイルに書き込む
        let contents = serde_json::to_string(&config).map_err(|e| e.to_string())?;
        file.write_all(contents.as_bytes())
            .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("プロジェクトディレクトリの作成に失敗しました。".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_app_config, save_app_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
