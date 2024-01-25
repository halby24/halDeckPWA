using Microsoft.Win32;
using System.Text.Json;
using System.Text.Json.Serialization;

public class Desktops
{
    [JsonPropertyName("desktops")]
    public Desktop[] DesktopArray { get; set; }
    [JsonPropertyName("current")]
    public string Current { get; set; }
}

public class Desktop
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; }
}

string keyPath = @"Software\Microsoft\Windows\CurrentVersion\Explorer\VirtualDesktops";
using (RegistryKey key = Registry.CurrentUser.OpenSubKey(keyPath))
{
    if (key == null)
    {
        return;
    }

    var o = key.GetValue("VirtualDesktopIDs");
    if (o == null)
    {
        return;
    }

    var desktopList = new List<Desktop>();
    var ids = (byte[])o;
    var count = ids.Length / 16;
    for (int i = 0; i < count; i++)
    {
        var id = new Guid(ids.Skip(i * 16).Take(16).ToArray());
        Console.Error.WriteLine(id);

        var desktopKeyPath = $@"{keyPath}\Desktops\{{{id}}}";
        using (RegistryKey desktopKey = Registry.CurrentUser.OpenSubKey(desktopKeyPath))
        {
            if (desktopKey == null)
            {
                continue;
            }

            var name = desktopKey.GetValue("Name") as string;
            Console.Error.WriteLine(name);

            var desktop = new Desktop
            {
                Id = id.ToString(),
                Name = name
            };

            desktopList.Add(desktop);
        }
    }

    {
        var id = new Guid(key.GetValue("CurrentVirtualDesktop") as byte[]);
        Console.Error.WriteLine(id);

        var desktops = new Desktops
        {
            DesktopArray = desktopList.ToArray(),
            Current = id.ToString()
        };

        var jsonStr = JsonSerializer.Serialize(desktops);
        Console.WriteLine(jsonStr);
    }
}