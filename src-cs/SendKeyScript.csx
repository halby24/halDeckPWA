using System;
using System.Runtime.InteropServices;

public class KeyboardSend
{
    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, ref INPUT pInputs, int cbSize);

    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT
    {
        public uint type;
        public InputUnion U;
        public static int Size
        {
            get { return Marshal.SizeOf(typeof(INPUT)); }
        }
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct InputUnion
    {
        [FieldOffset(0)]
        public MOUSEINPUT mi;
        [FieldOffset(0)]
        public KEYBDINPUT ki;
        [FieldOffset(0)]
        public HARDWAREINPUT hi;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT
    {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT
    {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct HARDWAREINPUT
    {
        public uint uMsg;
        public ushort wParamL;
        public ushort wParamH;
    }

    public static void SendKey(ushort keyCode)
    {
        INPUT input = new INPUT
        {
            type = 1, // Keyboard input
            U = new InputUnion
            {
                ki = new KEYBDINPUT
                {
                    wVk = keyCode,
                    wScan = 0,
                    dwFlags = 0,
                    time = 0,
                    dwExtraInfo = IntPtr.Zero
                }
            }
        };

        SendInput(1, ref input, INPUT.Size);
        input.U.ki.dwFlags = 2; // KEYEVENTF_KEYUP
        SendInput(1, ref input, INPUT.Size);
    }
}

// スクリプトの残りの部分（クラス定義など）は省略して、主要な修正点に焦点を当てます

if (Args.Count > 0)
{
    // コマンドライン引数からキーコードを取得して変換
    var keyCodeArg = Args[0];
    // 16進数の文字列として受け取るため、変換処理を追加
    var keyCodeI32 = Convert.ToInt32(keyCodeArg, 16);
    if (keyCodeI32 >= 0 && keyCodeI32 <= ushort.MaxValue)
    {
        var keyCode = (ushort)keyCodeI32;
        KeyboardSend.SendKey(keyCode);
    }
    else
    {
        Console.WriteLine($"Invalid keycode: {keyCodeArg}");
    }
}
else
{
    Console.WriteLine("Usage: dotnet script SendKeyWithArgs.csx <keycode in hex>");
}
