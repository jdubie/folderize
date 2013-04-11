all: clean run

run:
	DEBUG=* node index.js -s 2

clean:
	rm -rf dir[0-9]*
