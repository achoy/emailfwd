#!/bin/bash

sudo cp virtual.txt /etc/postfix/virtual
sudo postmap /etc/postfix/virtual
sudo service postfix reload

