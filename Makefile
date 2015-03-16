MOCHA=./node_modules/.bin/mocha -u bdd -r test/config.js
ISTANBUL=node_modules/.bin/istanbul

UNIT_TEST_FILES=$(shell find . -name "*.spec.js")

unit:
	 ${MOCHA} ${ARGS} ${UNIT_TEST_FILES}

#int:
#	 ${MOCHA} ${ARGS} ./**/*.int.js

coverage:
	 $(ISTANBUL) cover _mocha -- -u bdd -R spec ${ARGS} ${UNIT_TEST_FILES}


all: unit int


.PHONY: unit int coverage all