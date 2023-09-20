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
bun run   // run in production mode
bun dev   // run in development mode (hot reload)
```

## Configuring Raspberry Pi
There are other valid methods to configure this codebase.

Below are my notes for my Raspberry Pi 3B running Raspberry Pi OS 11. The intended audience is my future self who may need to undo or repeat these efforts.

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
Clear existing FORWARD rules and set default policy to DROP for the FORWARD chain
```bash
sudo iptables -F FORWARD
sudo iptables -P FORWARD DROP
```
Allow traffic to/from the Pi
```bash
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o wlan0 -j ACCEPT
```
Redirect all traffic to the captive portal
```bash
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.0.0.1:8080
```
