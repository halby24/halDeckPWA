// See https://aka.ms/new-console-template for more information
using WindowsDesktop;

// STA モードで実行するためのメソッドを定義
void RunInSTAThread()
{
    // UI 関連の処理をここに記述
    // Get all virtual desktops
    var desktops = VirtualDesktop.GetDesktops();
    foreach (var desktop in desktops)
    {
        Console.WriteLine(desktop.Id);
    }
}

// 新しいスレッドを作成し、STA に設定
var staThread = new Thread(RunInSTAThread);
staThread.SetApartmentState(ApartmentState.STA);

// スレッドを開始
staThread.Start();
staThread.Join(); // 必要に応じてメインスレッドからの処理完了を待機