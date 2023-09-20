# Otus Capture The Flag 2023

## Overview

This project was designed to run on a Raspberry Pi 3B.

The server is written using the BETH stack: Bun, ElysiaJS, Turso (SQLite), and HTMX.

## Running Locally

### Pre-requisites

Bun should be installed. On MacOS, this can be done via `brew install bun`. See https://bun.sh/ for more information.

### Installing Dependencies
Use `bun` to install dependencies
```bash
bun install
```

### Running the Server
Use `bun` to run the project
```bash
bun start   // run in production mode
bun dev     // run in development mode (hot reload)
```

## Configuring Raspberry Pi
There are other valid methods to configure this codebase.

Below are my notes for my Raspberry Pi 3B running Raspberry Pi OS 11. The intended audience is my future self who may need to undo or repeat these efforts.

### Setup nginx to forward traffic and populate headers
Install `nginx`
```bash
sudo apt install nginx nginx-extras

```
Edit/Update config
```bash
sudo vi /etc/nginx/sites-available/default
```
Contents of config
```
server {
    listen 8080;

    # Apple's captive portal detection
    location /library/test/success.html {
        default_type text/plain;
        return 200 "Success\n";
    }

    # Google's (Android) captive portal detection
    location /generate_204 {
        return 204;
    }

    # Microsoft's (Windows) captive portal detection
    location /redirect {
        return 302 http://www.msftconnecttest.com/connecttest.txt;
    }

    # Default server configuration, e.g., your challenge or captive portal page
    location / {
        set $mac_address "";
        rewrite_by_lua_block {
            local handle = io.popen("/home/j/get_mac.sh " .. ngx.var.remote_addr)
            local result = handle:read("*a")
            handle:close()
            ngx.var.mac_address = result
        }
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-MAC-Address $mac_address;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Create `get_mac.sh` to retrieve the Mac Address
```
vi /home/j/get_mac.sh
```
Contents
```
#!/bin/bash
IP=$1
MAC=$(arp -an | grep $IP | awk '{print $4}')
echo $MAC
```

Restart nginx to apply the changes
```bash
sudo systemctl restart nginx
```

### Setup `systemd` to run this codebase
Create/edit service file
```bash
sudo vi /etc/systemd/system/otus-onsite-2023.service
```
Contents
```
[Unit]
Description=Otus CTF 2023
After=network.target

[Service]
ExecStart=/usr/bin/env bun start
Restart=always
User=j
Group=users
Environment=PATH=/home/j/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
WorkingDirectory=/home/j/Projects/otus-onsite-2023

[Install]
WantedBy=multi-user.target
```

Reload `systemd`
```bash
sudo systemctl daemon-reload
```

Enable and Start the Service
```bash
sudo systemctl enable otus-onsite-2023.service
sudo systemctl start otus-onsite-2023.service
```

Check status of Service
```bash
sudo systemctl status otus-onsite-2023.service
```

### Install `hostapd` and `dnsmasq`
```bash
sudo apt install hostapd dnsmasq
```
### hostapd - Host Access Point Daemon

#### Configure Access Point
```bash
sudo vi /etc/hostapd/hostapd.conf
```
Public Access
```
interface=wlan0
driver=nl80211
ssid=Otus CTF 2023
hw_mode=g
channel=6
auth_algs=1
wmm_enabled=0
macaddr_acl=0
ignore_broadcast_ssid=0
```

#### Set config to use
Open default profile
```bash
sudo vi /etc/default/hostapd
```
Set DAEMON_CONF for the profile
```
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

### dnsmasq - lightweight DNS/DHCP server

#### Configure DNS
Open dnsmasq config
```bash
sudo vi /etc/dnsmasq.conf
```
Set DHCP range, default gateway, forward all traffic to 10.0.0.1
```
interface=wlan0
dhcp-range=10.0.0.2,10.0.0.100,255.255.255.0,24h
dhcp-option=3,10.0.0.1
dhcp-option=6,10.0.0.1
address=/#/10.0.0.1
```

#### Configure Static IP for wlan0
Open config
```bash
sudo vi /etc/dhcpcd.conf
```
Add this to the end of the file
```
interface wlan0
static ip_address=10.0.0.1/24
nohook wpa_supplicant
```

### iptables - linux built in firewall

#### Enable IP forwarding
Open sysctl.config
```bash
sudo vi /etc/sysctl.conf
```
Uncomment this line
```
net.ipv4.ip_forward=1
```

#### Setup `iptables` rules
```bash
sudo iptables -F FORWARD        # clear existing FORWARD rules
sudo iptables -P FORWARD DROP   # set default policy to DROP for the FORWARD chain
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT   # Allow traffic to/from the Pi
sudo iptables -A FORWARD -i eth0 -o wlan0 -j ACCEPT   # Allow traffic to/from the Pi
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.0.0.1:8080    # Redirect all traffic to the captive portal
sudo iptables -A INPUT -i eth0 -p tcp --dport 22 -j ACCEPT    # Allow SSH on `eth0`
sudo iptables -A INPUT -i wlan0 -p tcp --dport 22 -j DROP     # Block SSH on `wlan0`
```

#### Save iptables rules & load on boot
Save the current rules to disk
```bash
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
```
Add a network interfaces file
```bash
sudo vi /etc/network/interfaces.d/iptables-setup
```
Contents of `/etc/network/interfaces.d/iptables-setup`
```
pre-up iptables-restore < /etc/iptables.ipv4.nat
```
Set as executable
```bash
sudo chmod +x /etc/network/interfaces.d/iptables-setup
```

### Enable & Start Services
Unmask the services
```bash
sudo systemctl unmask hostapd
sudo systemctl unmask dnsmasq
```
Enable and start `hostapd` and `dnsmasq`
```bash
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq
sudo systemctl start hostapd
sudo systemctl start dnsmasq
```

### Restart the system
```bash
sudo reboot
```